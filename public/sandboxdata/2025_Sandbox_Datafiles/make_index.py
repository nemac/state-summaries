#!/usr/bin/env python3
import os, glob
import pandas as pd
import argparse

jsonFile = 'index.json'
processingFile =  'make_index.py'
htmlFile =  'index.html'
dsStore = '.DS_Store'

EXCLUDED = [htmlFile, processingFile, jsonFile, dsStore]

removeFields = ['#grids']

# May need to do "pip install mako"
from mako.template import Template
import json

def main():
    fnames = [fname for fname in sorted(os.listdir('.')) if fname not in EXCLUDED]
    for fn in fnames:
       oldbase = os.path.splitext(fn)
       newname = fn.replace('.csv', '.txt')
       os.rename(fn, newname)
       df = pd.read_csv(newname)

       # make file headers consistent
       for colName in df.columns:
           df.rename(columns={' Year': 'Year', 'year': 'Year'}, inplace=True)
           if 'regions' in newname:
               df.rename(columns={'AK': 'Alaska', 'HI': 'Hawaii', 'MW': 'Midwest', 'NE': 'Northeast', 'NGP': 'Northern Great Plains', 'NW': 'Northwest', 'SE': 'Southeast', 'SGP': 'Southern Great Plains', 'SW': 'Southwest'}, inplace=True)

           for deleteField in removeFields:
               if deleteField in colName:
                   df.drop(columns = [colName], inplace= True)

       df.to_csv(newname, index=False)

    data = {
        'CONUS' : [],
        'regions' : [],
        'states' : [],
    }

    fnames = [fname for fname in sorted(os.listdir('.')) if fname not in EXCLUDED]
    for fn in fnames:
        parts = fn.split('_')
        for ft in data.keys():
            if fn.startswith(ft):
                robust = False
                
                # New format: CONUS_prcp_1inch_1900-2024_SCS2025.txt
                # parts[0] = data area (CONUS/regions/states)
                # parts[1] = data type high level (prcp/tmax/tmean/tmin)  
                # parts[2] = data type specific (1inch/2inch/ann/djf/etc)
                # parts[3] = years (1900-2024)
                
                data_type = parts[1] + "_" + parts[2]  # e.g., "prcp1inch" or "tmaxann"
                
                # Parse year range from format like "1900-2024"
                year_part = parts[3]
                year_range = year_part.split('-')
                startYear = int(year_range[0])
                endYear = int(year_range[1])
                
                # Determine season from data type specific part
                season_mapping = {
                    'ann': 'yearly',
                    'djf': 'djf', 
                    'mam': 'mam',
                    'jja': 'jja', 
                    'son': 'son'
                }
                
                # Check if it's a seasonal file
                season = 'yearly'  # default
                for season_key, season_value in season_mapping.items():
                    if parts[2] == season_key:
                        season = season_value
                        break
                
                # Set robust flag if data starts from 1950
                if startYear == 1950:
                    robust = True

                data[ft].append({
                    "name": fn,
                    "type": data_type,
                    "start": startYear,
                    "end": endYear,
                    "robust": robust,
                    "period": str(startYear) + '-2024',
                    "season": season,
                })
                break;

    data['regional'] = data.pop('regions')
    with open(jsonFile, 'w+') as fd:
        fd.write(json.dumps(data, sort_keys=True, indent=4))


if __name__ == '__main__':
    main()
