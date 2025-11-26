from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# New endpoint for timeframe-specific chart data
@app.get("/api/chart/{ticker}/{timeframe}")
def get_chart_data(ticker: str, timeframe: str):
    """
    Fetch chart data with appropriate interval based on timeframe.
    Timeframes: 1D, 5D, 1M, 3M, 6M, YTD, 1Y, 5Y, All
    """
    try:
        stock = yf.Ticker(ticker)
        
        # Map timeframe to yfinance period and interval
        timeframe_config = {
            "1D": {"period": "1d", "interval": "1m"},
            "5D": {"period": "5d", "interval": "5m"},
            "1M": {"period": "1mo", "interval": "30m"},
            "3M": {"period": "3mo", "interval": "1h"},
            "6M": {"period": "6mo", "interval": "1d"},  # 2h not supported, using 1d
            "YTD": {"period": "ytd", "interval": "1d"},
            "1Y": {"period": "1y", "interval": "1d"},
            "5Y": {"period": "5y", "interval": "1wk"},
            "All": {"period": "max", "interval": "1mo"}
        }
        
        config = timeframe_config.get(timeframe, {"period": "1y", "interval": "1d"})
        
        # Fetch historical data
        history = stock.history(period=config["period"], interval=config["interval"])
        
        # Calculate SMAs for daily/weekly/monthly data
        if config["interval"] in ["1d", "1wk", "1mo"]:
            for sma_period in [50, 100, 150, 200]:
                history[f"SMA_{sma_period}"] = history["Close"].rolling(window=sma_period).mean()
        
        # Format data
        chart_data = []
        for date, row in history.iterrows():
            # Format date/time based on interval
            if config["interval"] in ["1m", "5m", "30m", "1h"]:
                date_str = date.strftime("%Y-%m-%d %H:%M")
            else:
                date_str = date.strftime("%Y-%m-%d")
            
            item = {
                "date": date_str,
                "close": row["Close"]
            }
            
            # Add SMAs if they exist
            for sma_period in [50, 100, 150, 200]:
                if f"SMA_{sma_period}" in row and not pd.isna(row[f"SMA_{sma_period}"]):
                    item[f"SMA_{sma_period}"] = row[f"SMA_{sma_period}"]
            
            chart_data.append(item)
        
        return {"data": chart_data, "interval": config["interval"]}
        
    except Exception as e:
        print(f"Error fetching chart data for {ticker} ({timeframe}): {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
