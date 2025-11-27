from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

artifact = joblib.load("best_xgb_Optuna_model.pkl")
model = artifact["model"]
scaler = artifact["scaler"]
feature_names = artifact["feature_names"]

HISTORY_FILE = "history.csv"

if not os.path.exists(HISTORY_FILE):
    history_df = pd.DataFrame(columns=[
        "Store", "Dept", "Date", "Weekly_Sales", "Temperature", "Fuel_Price",
        "CPI", "Unemployment", "IsHoliday", "Type", "Size"
    ])
    history_df.to_csv(HISTORY_FILE, index=False)
else:
    history_df = pd.read_csv(HISTORY_FILE)
    history_df["Date"] = pd.to_datetime(history_df["Date"])

def create_features(df):
    df = df.sort_values(['Store', 'Dept', 'Date']).reset_index(drop=True)

    df['Year'] = df['Date'].dt.year
    df['Month'] = df['Date'].dt.month
    df['Week'] = df['Date'].dt.isocalendar().week
    df['DayOfYear'] = df['Date'].dt.dayofyear
    df['Quarter'] = df['Date'].dt.quarter
    df['Month_sin'] = np.sin(2 * np.pi * df['Month']/12)
    df['Month_cos'] = np.cos(2 * np.pi * df['Month']/12)
    df['Week_sin'] = np.sin(2 * np.pi * df['Week']/52)
    df['Week_cos'] = np.cos(2 * np.pi * df['Week']/52)

    df = pd.get_dummies(df, columns=['Type'], drop_first=False)
    for col in ['Type_A','Type_B','Type_C']:
        if col not in df:
            df[col] = 0

    lag_periods = [1,4,8,12]
    for lag in lag_periods:
        df[f'Weekly_Sales_lag_{lag}'] = df.groupby(['Store','Dept'])['Weekly_Sales'].shift(lag)

    window_sizes = [4,8,12]
    for window in window_sizes:
        df[f'Weekly_Sales_rolling_mean_{window}'] = df.groupby(['Store','Dept'])['Weekly_Sales'].transform(
            lambda x: x.rolling(window=window, min_periods=1).mean()
        )
        df[f'Weekly_Sales_rolling_std_{window}'] = df.groupby(['Store','Dept'])['Weekly_Sales'].transform(
            lambda x: x.rolling(window=window, min_periods=1).std()
        )

    store_stats = df.groupby(['Store', 'Date']).agg({'Weekly_Sales':['sum','mean','std']}).reset_index()
    store_stats.columns = ['Store','Date','Store_Total_Sales','Store_Avg_Sales','Store_Std_Sales']
    df = df.merge(store_stats, on=['Store','Date'], how='left')

    dept_stats = df.groupby(['Dept','Date']).agg({'Weekly_Sales':['sum','mean','std']}).reset_index()
    dept_stats.columns = ['Dept','Date','Dept_Total_Sales','Dept_Avg_Sales','Dept_Std_Sales']
    df = df.merge(dept_stats, on=['Dept','Date'], how='left')

    return df

@app.route("/predict", methods=["POST"])
def predict():
    global history_df

    try:
        data = request.get_json()
        
        store = data["Store"]
        dept = data["Dept"]
        date = pd.to_datetime(data["Date"])
        temperature = data["Temperature"]
        fuel_price = data["Fuel_Price"]
        cpi = data["CPI"]
        unemployment = data["Unemployment"]
        is_holiday = data["IsHoliday"]
        store_type = data["Type"]
        size = data["Size"]
        
        year = date.year
        month = date.month
        week = date.isocalendar().week
        day_of_year = date.dayofyear
        quarter = date.quarter
        month_sin = np.sin(2 * np.pi * month/12)
        month_cos = np.cos(2 * np.pi * month/12)
        week_sin = np.sin(2 * np.pi * week/52)
        week_cos = np.cos(2 * np.pi * week/52)
        
        type_a = 1 if store_type == 'A' else 0
        type_b = 1 if store_type == 'B' else 0
        type_c = 1 if store_type == 'C' else 0
        
        store_dept_history = history_df[
            (history_df['Store'] == store) & 
            (history_df['Dept'] == dept) &
            (history_df['Date'] < date)
        ].sort_values('Date')
        
        if len(store_dept_history) >= 12:
            recent_sales = store_dept_history['Weekly_Sales'].tail(12).values
            lag_1 = recent_sales[-1] if len(recent_sales) >= 1 else 0
            lag_4 = recent_sales[-4] if len(recent_sales) >= 4 else 0
            lag_8 = recent_sales[-8] if len(recent_sales) >= 8 else 0
            lag_12 = recent_sales[-12] if len(recent_sales) >= 12 else 0
            
            rolling_mean_4 = recent_sales[-4:].mean() if len(recent_sales) >= 4 else recent_sales.mean()
            rolling_std_4 = recent_sales[-4:].std() if len(recent_sales) >= 4 else 0
            rolling_mean_8 = recent_sales[-8:].mean() if len(recent_sales) >= 8 else recent_sales.mean()
            rolling_std_8 = recent_sales[-8:].std() if len(recent_sales) >= 8 else 0
            rolling_mean_12 = recent_sales.mean()
            rolling_std_12 = recent_sales.std() if len(recent_sales) > 1 else 0
        else:
            overall_mean = history_df['Weekly_Sales'].mean()
            lag_1 = lag_4 = lag_8 = lag_12 = overall_mean if not pd.isna(overall_mean) else 0
            rolling_mean_4 = rolling_mean_8 = rolling_mean_12 = overall_mean if not pd.isna(overall_mean) else 0
            rolling_std_4 = rolling_std_8 = rolling_std_12 = history_df['Weekly_Sales'].std() if not pd.isna(history_df['Weekly_Sales'].std()) else 0
        
        store_history_at_date = history_df[
            (history_df['Store'] == store) & 
            (history_df['Date'] < date)
        ]
        if len(store_history_at_date) > 0:
            store_total_sales = store_history_at_date.groupby('Date')['Weekly_Sales'].sum().mean()
            store_avg_sales = store_history_at_date.groupby('Date')['Weekly_Sales'].mean().mean()
            store_std_sales = store_history_at_date.groupby('Date')['Weekly_Sales'].std().mean()
        else:
            store_total_sales = history_df.groupby(['Store', 'Date'])['Weekly_Sales'].sum().mean() if not history_df.empty else 0
            store_avg_sales = history_df.groupby(['Store', 'Date'])['Weekly_Sales'].mean().mean() if not history_df.empty else 0
            store_std_sales = history_df.groupby(['Store', 'Date'])['Weekly_Sales'].std().mean() if not history_df.empty else 0
        
        dept_history_at_date = history_df[
            (history_df['Dept'] == dept) & 
            (history_df['Date'] < date)
        ]
        if len(dept_history_at_date) > 0:
            dept_total_sales = dept_history_at_date.groupby('Date')['Weekly_Sales'].sum().mean()
            dept_avg_sales = dept_history_at_date.groupby('Date')['Weekly_Sales'].mean().mean()
            dept_std_sales = dept_history_at_date.groupby('Date')['Weekly_Sales'].std().mean()
        else:
            dept_total_sales = history_df.groupby(['Dept', 'Date'])['Weekly_Sales'].sum().mean() if not history_df.empty else 0
            dept_avg_sales = history_df.groupby(['Dept', 'Date'])['Weekly_Sales'].mean().mean() if not history_df.empty else 0
            dept_std_sales = history_df.groupby(['Dept', 'Date'])['Weekly_Sales'].std().mean() if not history_df.empty else 0
        
        features = {
            'Store': store,
            'Dept': dept,
            'IsHoliday': 1 if is_holiday else 0,
            'Temperature': temperature,
            'Fuel_Price': fuel_price,
            'CPI': cpi,
            'Unemployment': unemployment,
            'Year': year,
            'Month': month,
            'Week': week,
            'DayOfYear': day_of_year,
            'Quarter': quarter,
            'Month_sin': month_sin,
            'Month_cos': month_cos,
            'Week_sin': week_sin,
            'Week_cos': week_cos,
            'Size': size,
            'Store_Total_Sales': store_total_sales,
            'Store_Avg_Sales': store_avg_sales,
            'Store_Std_Sales': store_std_sales,
            'Dept_Total_Sales': dept_total_sales,
            'Dept_Avg_Sales': dept_avg_sales,
            'Dept_Std_Sales': dept_std_sales,
            'Weekly_Sales_lag_1': lag_1,
            'Weekly_Sales_lag_4': lag_4,
            'Weekly_Sales_lag_8': lag_8,
            'Weekly_Sales_lag_12': lag_12,
            'Weekly_Sales_rolling_mean_4': rolling_mean_4,
            'Weekly_Sales_rolling_std_4': rolling_std_4,
            'Weekly_Sales_rolling_mean_8': rolling_mean_8,
            'Weekly_Sales_rolling_std_8': rolling_std_8,
            'Weekly_Sales_rolling_mean_12': rolling_mean_12,
            'Weekly_Sales_rolling_std_12': rolling_std_12,
            'Type_A': type_a,
            'Type_B': type_b,
            'Type_C': type_c
        }
        
        model_features = ['Store', 'Dept', 'IsHoliday', 'Temperature', 'Fuel_Price', 'CPI', 'Unemployment', 
                         'Year', 'Month', 'Week', 'DayOfYear', 'Quarter', 'Month_sin', 'Month_cos', 
                         'Week_sin', 'Week_cos', 'Size', 'Store_Total_Sales', 'Store_Avg_Sales', 
                         'Store_Std_Sales', 'Dept_Total_Sales', 'Dept_Avg_Sales', 'Dept_Std_Sales', 
                         'Weekly_Sales_lag_1', 'Weekly_Sales_lag_4', 'Weekly_Sales_lag_8', 'Weekly_Sales_lag_12', 
                         'Weekly_Sales_rolling_mean_4', 'Weekly_Sales_rolling_std_4', 'Weekly_Sales_rolling_mean_8', 
                         'Weekly_Sales_rolling_std_8', 'Weekly_Sales_rolling_mean_12', 'Weekly_Sales_rolling_std_12',
                         'Type_A', 'Type_B', 'Type_C']
        
        X_model = pd.DataFrame([features], columns=model_features)
        
        X_model = X_model.fillna(0)
        
        prediction = model.predict(X_model)[0]

        return jsonify({"prediction": float(prediction), "status": "success"})

    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

@app.route("/", methods=["GET"])
def home():
    return {"message": "XGBoost model with automatic feature engineering API running!"}

if __name__ == "__main__":
    app.run(debug=True, port=3004)