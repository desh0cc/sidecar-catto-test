import sqlite3

def get_conn():
    return sqlite3.connect("catto.db")

def create_tables():
    with get_conn() as conn:
        cursor = conn.cursor()

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS saved (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                link VARCHAR NOT NULL
            );
            """
        )

        conn.commit()

def create_cat(link: str) -> bool:
    try:
        with get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO saved (link) VALUES (?)", (link,))
            conn.commit()
        return True
    except Exception as e:
        print(f"[ERROR] Failed to save cat: {e}")
        return False


def get_cats():
    with get_conn() as conn:
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM saved"
        )
        
        rows = cursor.fetchall()
        return [{"id": row[0], "image_path": row[1]} for row in rows]
    
def delete_cat(src: str):
    try:
        with get_conn() as conn:
            cursor = conn.cursor()

            cursor.execute(
                """
                DELETE FROM saved
                WHERE link = ?
                """,
                (src,)
            )

            conn.commit()

        return True
    except Exception as e:
        print(e)
        return False