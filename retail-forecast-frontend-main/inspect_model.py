import joblib
import pandas as pd

try:
    artifact = joblib.load("backend/best_xgb_Optuna_model.pkl")
    print("Keys:", artifact.keys())
    if "feature_names" in artifact:
        print("Feature Names:", artifact["feature_names"])
    else:
        print("No feature_names found.")
except Exception as e:
    print(e)
