import yfinance as yf
import pandas as pd
import numpy as np

def check_trend(series, trend_type="increasing", tolerance=0.05):
    # Drop NaNs first
    series = series.dropna()
    
    if series.empty or len(series) < 2: 
        print(f"  -> Series empty or too short: {len(series)}")
        return False
    
    # Ensure Descending Order (Newest First)
    series = series.sort_index(ascending=False)
    
    # Series is descending by date (Newest at index 0)
    newest = series.iloc[0]
    oldest = series.iloc[-1]
    
    print(f"  -> Newest ({series.index[0].date()}): {newest}")
    print(f"  -> Oldest ({series.index[-1].date()}): {oldest}")

    if trend_type == "increasing":
        # 1. Overall Increase (Newest > Oldest)
        if newest > oldest: 
            print("  -> Passed: Newest > Oldest")
            return True
        
        # 2. Linear Regression Slope (Check if generally trending up)
        try:
            y = series.values
            # We want slope of Oldest -> Newest. 
            # So reverse y to be Oldest -> Newest
            y_rev = y[::-1]
            x_rev = np.arange(len(y))
            slope, _ = np.polyfit(x_rev, y_rev, 1)
            print(f"  -> Slope: {slope}")
            if slope > 0: 
                print("  -> Passed: Positive Slope")
                return True
        except Exception as e:
            print(f"  -> Slope Error: {e}")
            pass

        # 3. Consistent Increase (Year over Year)
        chronological = series.iloc[::-1]
        consistent = True
        for i in range(1, len(chronological)):
            prev = chronological.iloc[i-1]
            curr = chronological.iloc[i]
            # Allow tolerance fluctuation
            if curr < prev * (1 - tolerance):
                print(f"  -> Failed consistency: {chronological.index[i].date()} ({curr}) < {chronological.index[i-1].date()} ({prev}) * {1-tolerance}")
                consistent = False
                break
        if consistent: print("  -> Passed: Consistent")
        return consistent

def debug_nvda():
    ticker = "NVDA"
    print(f"Fetching data for {ticker}...")
    stock = yf.Ticker(ticker)
    financials = stock.financials
    balance_sheet = stock.balance_sheet
    cashflow = stock.cashflow
    
    print("\n--- Financials Head ---")
    print(financials.head())
    
    # Helper to get series safely
    def get_series(df, key):
        if key in df.index:
            return df.loc[key]
        return pd.Series()

    # Extract Series
    revenue_series = get_series(financials, "Total Revenue")
    net_income_series = get_series(financials, "Net Income")
    op_income_series = get_series(financials, "Operating Income")
    op_cash_flow_series = get_series(cashflow, "Operating Cash Flow")
    if op_cash_flow_series.empty:
            op_cash_flow_series = get_series(cashflow, "Total Cash From Operating Activities")

    print("\n--- Checking Trends ---")
    
    print("\n1. Net Income:")
    print(net_income_series)
    check_trend(net_income_series, "increasing")

    print("\n2. Operating Cash Flow:")
    print(op_cash_flow_series)
    check_trend(op_cash_flow_series, "increasing")

    print("\n3. Operating Income:")
    print(op_income_series)
    check_trend(op_income_series, "increasing")

    print("\n4. Revenue:")
    print(revenue_series)
    check_trend(revenue_series, "increasing")

if __name__ == "__main__":
    debug_nvda()
