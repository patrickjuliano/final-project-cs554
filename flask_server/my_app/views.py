from my_app import app
import json
from prophet.serialize import model_to_json, model_from_json
import pandas as pd
from datetime import date, datetime, timedelta
from flask import Response

city_map = {
    'Austin': 'austin',
    'Miami': 'miami',
    'New York': 'newyork',
    'San Francisco': 'sanfran2',
    'Washington': 'washington'
}

def load_model(city):
    with open(f'./models/{city}.json', 'r') as fin:
        m = model_from_json(json.load(fin)) 
    return m

def map_city(city):
    return city_map[city]

def set_periods(cur_date):
    '''
    baseline training date
    currently set to 12/11/2022
    '''
    last_train_date = date(2022, 12, 11)
    return cur_date - last_train_date

@app.route("/<city>/<periods>")
def hello_world(city=None, periods=None):
    periods = int(periods)
    if int(periods) > 30:
        return Response('Can only predict up to 30 days')

    city_mapped = map_city(city) # remap the city
    m = load_model(city_mapped)
    today = datetime.now().strftime('%Y-%m-%d')
    date_split = list(map(int, today.split('-')))
    day_adder = set_periods(date(date_split[0], date_split[1], date_split[2])).days
    future = m.make_future_dataframe(periods=int(periods)+day_adder) 
    forecast = m.predict(future)
    forecast['city'] = city
    mask = (forecast['ds'] > today) & (forecast['ds'] <= (datetime.now() + timedelta(days=int(periods))).strftime('%Y-%m-%d')) 
    df = forecast.loc[mask][['city','ds','yhat']]
    df.ds = df.ds.dt.strftime('%Y-%m-%d')
    df_json = df.to_json(orient="records") 
    return Response(
        df_json, mimetype='application/json'
    )

  

    