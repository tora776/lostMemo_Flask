import psycopg2

class DB():
    def __init__(self) -> None:
        self.conn = None

    ########################
    # DBコネクト
    ########################
    def connect_to_db(self):
        try:
            self.conn = psycopg2.connect(
                user="postgres",
                password="root",
                host="localhost",
                port="5432",
                dbname="losts_db"
            )
            #クライアントプログラムのエンコードを設定（DBの文字コードから自動変換してくれる）
            self.conn.set_client_encoding('utf-8') 
        except (Exception, psycopg2.Error) as error:
            print("Error while connecting to PostgreSQL", error)
            self.conn = None
        

    ########################
    # Query実行
    ########################
    # データ取得(Select)
    def sqlSelectExcute(self, sqlStr):
        ret = None
        self.connect_to_db()
        if self.conn is None:
            return ret

        try:
            cursor = self.conn.cursor()
            cursor.execute(sqlStr)
            ret = cursor.fetchall()
        except(Exception) as ex:
            print(f'Error : sqlSelectExcute [sql : [{sqlStr}]  [{ex}]')
        finally:
            if self.conn:
                self.conn.close()
        
        return ret
    
    # データ取得なし(Insert, Update, Delete)
    def sqlExcute(self, sqlStr):
        ret = False

        self.connect_to_db()
        if self.conn is None:
            return ret
        
        try:
            cursor = self.conn.cursor()
            cursor.execute(sqlStr)
            self.conn.commit()
            ret = True
        except(Exception) as ex:
            print(f'Error : sqlExcute [sql : [{sqlStr}]  [{ex}]')
        finally:
            if self.conn:
                self.conn.close()

        return ret         

    ########################
    # Query作成
    ########################
    # Select文
    def selectQuery(self, table, cols, condition_cols=[], condition_vals=[]):
        query = ''
        if table == '' or len(cols) == 0:
            return query
        
        #################
        # Query文字列
        #################
        # column
        colStr = ''
        for col in cols:
            if col != '':
                if colStr == '':
                    colStr = col
                else:
                    colStr = f'{colStr}, {col}'
        # 条件
        conditionStr = ''
        if len(condition_cols) > 0 and len(condition_vals) > 0 and len(condition_cols) == len(condition_vals):
            for i in range(len(condition_cols)):
                if conditionStr == '':
                    conditionStr = f'{condition_cols[i]} = \'{condition_vals[i]}\''
                else:
                    conditionStr = f'{conditionStr} AND {condition_cols[i]} = \'{condition_vals[i]}\''

        #################
        # Query生成
        #################
        query = f'SELECT {colStr} FROM {table}'
        if not conditionStr == '':
            query = f'{query} WHERE {conditionStr}'

        return query
    
    # Insert
    def insertQuery(self, table, cols, vals):
        query = ''
        if table == '' or len(cols) == 0 or len(vals) == 0 or not len(cols) == len(vals):
            return query
        
        #################
        # Query文字列
        #################
        # column
        colStr = ''
        for col in cols:
            if colStr == '':
                colStr = col
            else:
                colStr = f'{colStr}, {col}'
        # value
        valStr = ''
        for val in vals:
            if valStr == '':
                valStr = f"'{val}'"
            
            else:
                if val == 'CURRENT_TIMESTAMP':  # CURRENT_TIMESTAMPの場合はクォーテーションを外す
                    valStr = f'{valStr}, {val}'
                else:
                    valStr = f'{valStr}, \'{val}\''
            
        #################
        # Query生成
        #################
        query = f'INSERT INTO {table} ({colStr}) VALUES ({valStr})'

        return query
    
    # Update
    def updateQuery(self, table, cols, vals, condition_cols, condition_vals=''):
        query = ''
        if table == '' or len(cols) == 0 or len(vals) == 0 or not len(cols) == len(vals):
            return query
        
        #################
        # Query文字列
        #################
        setStr = ''
        for i in range(len(cols)):
            if setStr == '':
                setStr = f'{cols[i]} = {vals[i]}'
            else:
                setStr = f'{setStr}, {cols[i]} = {vals[i]}'
        # 条件
        conditionStr = ''
        if condition_vals != '':
            if conditionStr == '':
                conditionStr = f'{condition_cols[0]} = {condition_vals}'

        #################
        # Query生成
        #################
        query = f'UPDATE {table} SET {setStr}'
        if not conditionStr == '':
            query = f'{query} WHERE {conditionStr}'

        return query
        
    # Delete
    def deleteQuery(self, table, condition_cols=[], condition_vals=''):
        query = ''
        # 条件
        conditionStr = ''
        if condition_vals != '':
            if conditionStr == '':
                conditionStr = f"{condition_cols[0]} IN ({condition_vals})"

        if conditionStr == '':
            return query
        
        #################
        # Query生成
        #################
        query = f'DELETE FROM {table} WHERE {conditionStr}'

        return query

            
    #####################################################################
    # 全データ取得
    def selectAll(self):
        # Query作成
        table = 'losts'
        cols = ['id', "to_char(date, 'YYYYMMDD')", 'items', 'places', 'detailed_places']
        query = self.selectQuery(table, cols)
        query += " ORDER BY id"
        # Query実行
        ret = self.sqlSelectExcute(query)
        return ret   
    
    # 一部データ取得
    def select_data(self, columnList):
        # Query作成
        table = 'losts'
        cols = ['id', "to_char(date, 'YYYYMMDD')", 'items', 'places', 'detailed_places']
        condition_cols = columnList[0]
        condition_vals = columnList[1]
        query = self.selectQuery(table, cols, condition_cols, condition_vals)
        # Query実行
        query += " ORDER BY id"
        ret = self.sqlSelectExcute(query)
        return ret   

    # データ追加        
    def insert_data(self, user_id, items, places, detailed_places):
        # Query作成
        table = 'losts'
        cols = ['user_id', 'date', 'items', 'places', 'detailed_places']
        vals = [user_id, 'CURRENT_TIMESTAMP', items, places, detailed_places]
        query = self.insertQuery(table, cols, vals)
        # Query実行
        ret = self.sqlExcute(query)
        
        return ret

        # データ更新
    def update_data(self, idList, itemList, placeList, detailed_placeList):
        # Query作成
        table = 'losts'
        cols = ['items', 'places', 'detailed_places']
        condition_cols = ['id']
        for i in range(len(idList)):
            vals = [f"'{itemList[i]}'", f"'{placeList[i]}'", f"'{detailed_placeList[i]}'"]
            condition_vals = idList[i]
            query = self.updateQuery(table, cols, vals, condition_cols, condition_vals)
            # Query実行
            ret = self.sqlExcute(query)
        
        return ret
    
    # データ削除
    def delete_data(self, idList):
        # Query作成
        table = 'losts'
        condition_cols = ['id']
        condition_vals = idList
        query = self.deleteQuery(table, condition_cols, condition_vals)
        # Query実行
        ret = self.sqlExcute(query)
        
        return ret
    
    # ログインの際ユーザーが存在するか確認
    def userCheck(self, user_id, password):
        # Query作成
        table = 'users'
        cols = ['user_id', 'password']
        condition_cols = ['user_id', 'password']
        condition_vals = [user_id, password]
        query = self.selectQuery(table, cols, condition_cols, condition_vals)
        # Query実行
        ret = self.sqlSelectExcute(query)
        return ret
    
    def tokenRegister(self, user_id, token):
        # Query作成
        table = 'login_checks'
        cols = ['user_id', 'token','login_date']
        vals = [user_id, token, 'CURRENT_TIMESTAMP']
        query = self.insertQuery(table, cols, vals)
        print(query)
        # Query実行
        ret = self.sqlExcute(query)
        return ret
    
    def lastLoginCheckQuery(self, columnList):
        # Query作成
        table = 'login_checks'
        cols = ['MAX(login_date)']
        condition_cols = columnList[0]
        condition_vals = columnList[1]
        query = self.selectQuery(table, cols, condition_cols, condition_vals)
        # Query実行
        ret = self.sqlSelectExcute(query)
        return ret
    
    def createUser(self, user_id, password):
        # Query作成
        table = 'users'
        cols = ['user_id', 'password']
        vals = [user_id, password]
        query = self.insertQuery(table, cols, vals)
        # Query実行
        ret = self.sqlExcute(query)
        return ret