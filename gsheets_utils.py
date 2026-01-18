import pandas as pd


def ensure_columns(df, columns):
    """Asegura que el DataFrame tenga las columnas esperadas."""
    if df is None or df.empty:
        return pd.DataFrame(columns=columns)
    existing_cols = list(df.columns)
    for col in columns:
        if col not in df.columns:
            df[col] = ""
            existing_cols.append(col)
    return df[existing_cols]


def append_row(conn, worksheet, row_dict, columns):
    """Agrega una fila dict al worksheet usando streamlit_gsheets."""
    df = conn.read(worksheet=worksheet)
    df = ensure_columns(df, columns)
    df = pd.concat([df, pd.DataFrame([row_dict])], ignore_index=True)
    conn.update(worksheet=worksheet, data=df)
    return df
