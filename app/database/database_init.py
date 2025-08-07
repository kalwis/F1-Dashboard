import sqlite3
conn = sqlite3.connect("app/database/f1.db")
cursor = conn.cursor()
cursor.executescript(open("app/database/f1_schema.sql").read())
conn.commit()
conn.close()
