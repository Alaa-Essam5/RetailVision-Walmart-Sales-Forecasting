# RetailVision-Walmart-Sales-Forecasting

## Retail Sales Forecasting

>A comprehensive time-series forecasting project featuring advanced feature engineering, hyperparameter optimization with Optuna, and a 
>deployment-ready interactive dashboard.

### Make sure to visit the [Live Dashboard](https://sic.obay.site)

---

## Project Overview
This project aims to predict weekly sales for retail stores based on historical data, holiday information, and economic indicators (CPI, Unemployment, Fuel Prices). 

The solution moves beyond basic regression, utilizing advanced **Feature Engineering** (rolling windows, lag features) and **Ensemble Learning** to achieve high-precision forecasts. The final results are presented via a fully interactive web dashboard.

## Key Features

*   **Interactive Web Dashboard:** A user-friendly interface hosted [here](https://sic.obay.site) allowing users to explore data and view predictions dynamically.
*   **Advanced Feature Engineering:** Implementation of time-series specific features including:
    *   Lag features (past sales).
    *   Rolling window statistics (Mean/Std dev over 4, 8, 12 weeks).
    *   Cyclical date encoding (Sine/Cosine for months/weeks).
*   **Rigorous EDA:** In-depth Exploratory Data Analysis visualizing seasonal trends, holiday impacts, and feature correlations.
*   **Hyperparameter Optimization:** Utilized **RandomizedSearchCV** and **Optuna** to fine-tune XGBoost parameters for maximum performance.

#### A Note on Deep Learning (LSTM)
During the research phase, we experimented with several Deep Learning architectures, including **Long Short-Term Memory (LSTM)** networks and other Recurrent Neural Networks (RNNs). 

**Outcome:** Interestingly, **Tree-based ensemble methods (specifically XGBoost) significantly outperformed the Deep Learning models** on this specific dataset. 
*   *Why?* Tabular time-series data of this scale often benefits more from explicit feature engineering (lag/rolling features) combined with the gradient boosting mechanism than from the latent feature extraction of DL models. Consequently, the final deployed solution utilizes the optimized XGBoost model.


## Tech Stack

*   **Language:** Python 3
*   **Data Manipulation:** Pandas, NumPy
*   **Visualization:** Matplotlib, Seaborn, 
*   **Machine Learning:** Scikit-Learn, XGBoost
*   **Optimization:** Optuna
*   **Deployment:** ReactJs, recharts (for dashboard), Flask (for backend)

## Demo
[![Watch the demo](https://img.youtube.com/vi/VIDEO_ID/0.jpg)](https://github.com/user-attachments/assets/9f21de5e-fc2b-402c-9c5f-32c1f58ea5bf)
## Installation & Usage

1.  **Clone this repo:**
    ```bash
    git clone https://github.com/Alaa-Essam5/RetailVision-Walmart-Sales-Forecasting/
    cd RetailVision-Walmart-Sales-Forecasting
    ```

2.  **Install dependencies:**
    ```bash
    cd frontend 
    npm install
    ```

3.  **Run the analysis:**
    Open the Jupyter notebooks to view the step-by-step EDA and training process.

4.  **Launch the Dashboard**
    ```bash
    localhost:3000
    ```

## Authors

*   **Obay Rashad**
*   **Ahmed Hossam**
*   **Alaa Essam**

