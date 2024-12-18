from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from sql import DB
from data import createLostJson, getInsertList, sortColumn, getDeleteList, getUpdateList, encrypt, decrypt
import secrets, datetime, hashlib, os, jwt

app = Flask(__name__)
CORS(app, supports_credentials=True)
# 強力なランダム文字列を設定（推奨）
# app.config['SECRET_KEY'] = os.urandom(24).hex()
app.config['SECRET_KEY'] = "hgA1beolJN76jv3wWnmzj"

# login処理
@app.route('/login', methods=['POST'])
def login():
    try:
        db = DB()
        result = request.get_data()
        dataList = sortColumn(result)
        user_id = dataList[1][0]
        password = dataList[1][1]
        password_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()
        ret = db.userCheck(user_id, password_hash)
        if not ret:
            return "ユーザーIDかパスワードが異なります"
        token = secrets.token_hex()
        # ユーザーIDはハッシュ化してはいけない。元に戻せない。要修正。
        user_id_hash = hashlib.sha256(user_id.encode("utf-8")).hexdigest()
        # トークン有効期限
        expdate = datetime.datetime.now() + datetime.timedelta(days=1)
        # cookieに含めるトークンを記載
        token = jwt.encode({
            'user_id': user_id,
            'exp': int(expdate.timestamp())
        }, app.config['SECRET_KEY'], algorithm='HS256')
        # 暗号化
        db.tokenRegister(user_id_hash, token)
        # HttpOnly, Secure 属性付きクッキーにトークンを保存
        response = make_response(jsonify({'message': 'Login successful'}))
        response.set_cookie('auth_token', token, httponly=False, secure=True, samesite='Lax')
        return response
    except Exception as e:
        return jsonify({'error':e})


# 最終ログイン日時確認
@app.route('/lastLoginCheck', methods=['POST', 'GET'])
def lastLoginCheck():
    token = request.cookies.get('auth_token')  # クッキーからトークンを取得
    if not token:
        return jsonify({'message': 'Token is missing'}), 401

    try:
        # トークンをデコード
        decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        db = DB()
        # トークン格納テーブルに格納する際にユーザーIDを暗号化する
        user_id_hash = hashlib.sha256(decoded['user_id'].encode("utf-8")).hexdigest()
        condition_cols = ['user_id']
        condition_vals = [user_id_hash]
        columnList = [condition_cols, condition_vals]
        ret = db.lastLoginCheckQuery(columnList)
        tokenGetDate = ret[0][0]
        dt1 = datetime.datetime.now() - tokenGetDate
        # クエリ結果が存在しない場合、Falseを返す。Noneの想定。
        if not tokenGetDate:
            return jsonify({'message': 'トークンが存在しません'})
        # トークンの格納日付を確認する
        if dt1.days < 1:  
            return jsonify({'message': 'Welcome!'})
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401



# ユーザー作成
@app.route('/registUser', methods=['POST'])
def registUser():
    try:
        db = DB()
        result = request.get_data()
        dataList = sortColumn(result)
        if dataList[1][0] != '':
            user_id = dataList[1][0]
        if dataList[1][1] != '':
            password = dataList[1][1]
        password_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()
        ret = db.createUser(user_id, password_hash)
        return jsonify({'result': ret})
    except Exception as e:
        return jsonify({'error':e})
    

# 全検索
@app.route('/GetItem')
def GetItems():
    try:
        db = DB()
        ret = db.selectAll()
        return createLostJson(ret)
    except Exception as e:
        return jsonify({'error':e})

# 部分検索
@app.route('/SortItem', methods=['POST'])
def GetSelectItems():
    try:
        db = DB()
        result = request.get_data()
        columnList = sortColumn(result)
        # ユーザーIDを取得し、検索リストに追加する
        user_id = getUser_ID()
        columnList[0].append('user_id')
        columnList[1].append(user_id)
        ret = db.select_data(columnList)
        return createLostJson(ret)
    except Exception as e:
        return jsonify({'error':e})

# データ追加
@app.route('/InsertItem', methods=['POST'])
def InsertItems():
    try:
        result = request.get_data()
        dataList = getInsertList(result)
        # ユーザーIDを取得し、検索リストに追加する
        user_id = getUser_ID()
        items = dataList[0]
        places = dataList[1]
        detailed_places = dataList[2]
        db = DB()
        db.insert_data(user_id, items, places, detailed_places)
        return dataList
    except Exception as e:
        return jsonify({'error':e})

# データ削除
@app.route('/DeleteItem', methods=['POST'])
def DeleteItems():
    try:
        db = DB()
        result = request.get_data()
        idList_str = getDeleteList(result)
        ret = db.delete_data(idList_str)
        return jsonify({'result': ret})
    except Exception as e:
        return jsonify({'error':e})

# データ更新
@app.route('/UpdateItem', methods=['POST'])
def UpdateItems():
    try:
        db = DB()
        result = request.get_data()
        dataList = getUpdateList(result)
        ret = db.update_data(dataList[0], dataList[1], dataList[2], dataList[3])
        # ret = db.selectAll()
        # return createLostJson(ret)
        return jsonify({'result': ret})
    except Exception as e:
        return jsonify({'error':e})

def getUser_ID():
    token = request.cookies.get('auth_token')  # クッキーからトークンを取得
    if not token:
        return jsonify({'message': 'Token is missing'}), 401

    try:
        # トークンをデコード
        decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        # トークン格納テーブルに格納する際にユーザーIDを暗号化する
        return decoded['user_id']
    except:
        return None


# Webサーバを起動する。ポートはiisで指定。
if __name__ == '__main__':
    app.run(debug=True)