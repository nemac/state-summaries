#!/usr/bin/env python3
# Ingest raw data deliveries and (re)build index.json.
#
# Usage: run from this directory. Any *.csv files present are treated as a new
# delivery: they are renamed to .txt, trailing tar NUL padding is stripped, and
# their headers are normalized to the column names the app matches against
# (config.ncaRegionAbbreviations / stateAbbreviations in src/configs/config.js).
# Single-state seasonal files (the HI+PR folder, e.g. HI_prcp_ann_1950-2024_SCS2025.csv)
# are merged into the matching states_ .txt file, which carries -999 for those states.
# Other existing .txt files are left byte-for-byte untouched.
#
# index.json is then rebuilt from every CONUS_/regions_/states_ .txt file. The
# start/end years come from the actual Year column, not the filename — some
# deliveries are named 1895-2024 but contain 1900-2024.
import os
import json
import pandas as pd

jsonFile = 'index.json'

# Header spellings seen across deliveries -> canonical app column names.
# Regions must match config.ncaRegionAbbreviations values exactly.
COLUMN_RENAMES = {
    ' Year': 'Year',
    'year': 'Year',
    # 2025/2026 regions delivery, underscore style (threshold files)
    'Northern_Rockies_Plains': 'Northern Rockies and Plains',
    'Ohio_Valley': 'Ohio Valley',
    'Upper_Midwest': 'Upper Midwest',
    # 2025/2026 regions delivery, ALL-CAPS style (seasonal/annual files)
    'NORTHEAST': 'Northeast',
    'NORTHERN ROCKIES PLAINS': 'Northern Rockies and Plains',
    'NORTHWEST': 'Northwest',
    'OHIO VALLEY': 'Ohio Valley',
    'SOUTH': 'South',
    'SOUTHEAST': 'Southeast',
    'SOUTHWEST': 'Southwest',
    'UPPER MIDWEST': 'Upper Midwest',
    'WEST': 'West',
}

# 2021-era abbreviated regions delivery. Only applied to regions_ files:
# AK/HI/NE are also real state codes in states_ files.
REGION_ABBREV_RENAMES = {
    'AK': 'Alaska', 'HI': 'Hawaii', 'MW': 'Midwest', 'NE': 'Northeast',
    'NGP': 'Northern Great Plains', 'NW': 'Northwest', 'SE': 'Southeast',
    'SGP': 'Southern Great Plains', 'SW': 'Southwest',
}

removeFields = ['#grids']

# Deliveries that hold one state per file; merged into states_ files, not ingested as-is.
SINGLE_STATE_PREFIXES = ('HI_', 'PR_')


def strip_tar_padding(fn):
    # Strip trailing tar block padding (NUL bytes) some deliveries carry.
    with open(fn, 'rb') as fd:
        raw = fd.read().rstrip(b'\x00')
    with open(fn, 'wb') as fd:
        fd.write(raw)


def is_delivered_csv(fn):
    return fn.endswith('.csv') and os.path.isfile(fn)


def ingest_new_csvs():
    for fn in sorted(os.listdir('.')):
        if not is_delivered_csv(fn) or fn.startswith(SINGLE_STATE_PREFIXES):
            continue
        newname = fn[:-4] + '.txt'
        strip_tar_padding(fn)

        df = pd.read_csv(fn)
        df.rename(columns=COLUMN_RENAMES, inplace=True)
        if fn.startswith('regions_'):
            df.rename(columns=REGION_ABBREV_RENAMES, inplace=True)
        for colName in list(df.columns):
            for deleteField in removeFields:
                if deleteField in colName:
                    df.drop(columns=[colName], inplace=True)
        df.to_csv(newname, index=False)
        if newname != fn:
            os.remove(fn)
        print(f'ingested {fn} -> {newname}')


def states_file_for(var, season):
    matches = [fn for fn in os.listdir('.') if fn.startswith(f'states_{var}_{season}_') and fn.endswith('.txt')]
    if len(matches) != 1:
        raise SystemExit(f'expected one states_{var}_{season}_ file, found {matches}')
    return matches[0]


def merge_single_state_csvs():
    for fn in sorted(os.listdir('.')):
        if not is_delivered_csv(fn) or not fn.startswith(SINGLE_STATE_PREFIXES):
            continue
        state, var, season = fn.split('_')[:3]
        target = states_file_for(var, season)
        strip_tar_padding(fn)
        single = pd.read_csv(fn).rename(columns=COLUMN_RENAMES).set_index('Year')[state]
        states = pd.read_csv(target)
        states[state] = states[state].astype(float)
        rows = states['Year'].isin(single.index)
        states.loc[rows, state] = single.loc[states.loc[rows, 'Year']].values
        states.to_csv(target, index=False)
        os.remove(fn)
        print(f'merged {fn} -> {target} ({int(rows.sum())} years)')


def build_index():
    data = {
        'CONUS': [],
        'regions': [],
        'states': [],
    }

    season_mapping = {
        'ann': 'yearly',
        'djf': 'djf',
        'mam': 'mam',
        'jja': 'jja',
        'son': 'son',
    }

    for fn in sorted(os.listdir('.')):
        if not fn.endswith('.txt') or not os.path.isfile(fn):
            continue
        parts = fn.split('_')
        for ft in data.keys():
            if not fn.startswith(ft + '_'):
                continue

            # Format: <area>_<var>_<detail>_<years>_SCS2025.txt
            # e.g. regions_prcp_1inch_1900-2024_SCS2025.txt
            data_type = parts[1] + '_' + parts[2]
            season = season_mapping.get(parts[2], 'yearly')

            # Year range from the data itself; filenames can be wrong
            # (e.g. named 1895-2024 but starting at 1900).
            years = pd.read_csv(fn, usecols=['Year'])['Year']
            startYear = int(years.min())
            endYear = int(years.max())

            data[ft].append({
                'name': fn,
                'type': data_type,
                'start': startYear,
                'end': endYear,
                'robust': startYear == 1950,
                'period': f'{startYear}-{endYear}',
                'season': season,
            })
            break

    with open(jsonFile, 'w+') as fd:
        fd.write(json.dumps(data, sort_keys=True, indent=4))
    counts = ', '.join(f'{k}: {len(v)}' for k, v in data.items())
    print(f'wrote {jsonFile} ({counts})')


def main():
    ingest_new_csvs()
    merge_single_state_csvs()
    build_index()


if __name__ == '__main__':
    main()
