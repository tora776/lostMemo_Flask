from flask import Flask, request, jsonify
from flask_cors import CORS
from sql import DB
from data import createLostJson, getInsertList, sortColumn, getDeleteList, getUpdateList, encrypt, decrypt
import secrets, datetime, hashlib

app = Flask(__name__)
CORS(app, supports_credentials=True)

# login処理
@app.route('/login', methods=['POST'])
def login():
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
    # 暗号化
    #encrypted_user_id = encrypt(user_id, "fb57965850625a43d1f1fcb278e957f848f4e77ae3634160eab46a3446e6eb99")
    db.tokenRegister(user_id_hash, token)
    
    return jsonify({'user_id': user_id_hash, 'token':token})

# 最終ログイン日時確認
@app.route('/lastLoginCheck', methods=['POST', 'GET'])
def lastLoginCheck():
    db = DB()
    result = request.get_data()
    dataList = sortColumn(result)
    ret = db.lastLoginCheckQuery(dataList)
    # クエリ結果が存在しない場合、Falseを返す。Noneの想定。
    if not ret[0][0]:
        return jsonify({'result': False})
    # トークン発行から24時間以上経っている場合、Falseを返す。
    dt1 = datetime.datetime.now() - ret[0][0]
    if dt1.days > 1:
        return jsonify({'result': False})
    return jsonify({'result': True})

# ユーザー作成
@app.route('/registUser', methods=['POST'])
def createUser():
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
    

# 全検索
@app.route('/GetItem')
def GetItems():
    db = DB()
    ret = db.selectAll()
    return createLostJson(ret)

# 部分検索
@app.route('/SortItem', methods=['POST'])
def GetSelectItems():
    db = DB()
    result = request.get_data()
    columnList = sortColumn(result)
    ret = db.select_data(columnList)
    return createLostJson(ret) 

# データ追加
@app.route('/InsertItem', methods=['POST'])
def InsertItems():
    result = request.get_data()
    dataList = getInsertList(result)
    db = DB()
    db.insert_data(dataList[0], dataList[1], dataList[2], dataList[3])
    return dataList

# データ削除
@app.route('/DeleteItem', methods=['POST'])
def DeleteItems():
    db = DB()
    result = request.get_data()
    idList_str = getDeleteList(result)
    ret = db.delete_data(idList_str)
    # ret = db.selectAll()
    #return createLostJson(ret) 
    return jsonify({'result': ret})

# データ更新
@app.route('/UpdateItem', methods=['POST'])
def UpdateItems():
    db = DB()
    result = request.get_data()
    dataList = getUpdateList(result)
    ret = db.update_data(dataList[0], dataList[1], dataList[2], dataList[3])
    # ret = db.selectAll()
    # return createLostJson(ret)
    return jsonify({'result': ret})



# Webサーバを起動する。ポートはiisで指定。
if __name__ == '__main__':
    app.run(debug=True)