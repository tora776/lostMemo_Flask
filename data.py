import pandas as pd, json
from sql import DB
from datetime import date, datetime
from flask import request
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Util import Padding
from hashlib import pbkdf2_hmac

# 暗号
def encrypt(text, passPhrase):

    salt = get_random_bytes(16)
    iv = get_random_bytes(16)

    # AESキーの生成(128bit、5万回)
    key = pbkdf2_hmac('sha256', bytes(passPhrase, encoding='utf-8'), salt, 50000, int(128 / 8))

    # 暗号
    aes = AES.new(key, AES.MODE_CBC, iv)
    data = Padding.pad(text.encode('utf-8'), AES.block_size, 'pkcs7')
    encrypted = aes.encrypt(data)

    return {
        'salt': salt,
        'iv': iv,
        'encrypted': encrypted
    }

# 復号
def decrypt(encryptedData, passPhrase):

    # AESキーの生成(128bit、5万回)
    key = pbkdf2_hmac('sha256', bytes(passPhrase, encoding='utf-8'), encryptedData['salt'], 50000, int(128 / 8))

    # 復号
    aes = AES.new(key, AES.MODE_CBC, encryptedData['iv'])
    plaintext = aes.decrypt(encryptedData['encrypted'])

    return plaintext.decode(encoding='utf-8')

    
def createLostJson(ret):
    df = pd.DataFrame(ret, columns = ['id', 'date', 'items', 'places', 'detailed_places'])
    dict = df.to_dict(orient="records")
    # date型, datetime型はjsonシリアライズができない
    dict_json = json.dumps(dict, default=json_serial, ensure_ascii=False)
    return dict_json


# date, datetimeの変換関数
def json_serial(obj):
    # 日付型の場合には、文字列に変換します
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    # 上記以外はサポート対象外.
    raise TypeError ("Type %s not serializable" % type(obj))


# テキストボックスから受け取ったデータを抽出
def getInsertList(res):
    dictForm = json.loads(res)
    valueList = []
    valueList = list(dictForm.values()) 
    print(valueList)
    return valueList

# チェックがついているidを抽出
def getDeleteList(res):
    checkList = json.loads(res)
    idList = []
    for i in range(len(checkList)):
        idList.append((checkList[i][0]))
    idList_str = ",".join(idList)
    return idList_str

def getUpdateList(res):
    checkList = json.loads(res)
    idList = []
    itemList = []
    placeList = []
    detailed_placeList = []
    for i in range(len(checkList)):
        idList.append((checkList[i][0]))
        itemList.append((checkList[i][2]))
        placeList.append((checkList[i][3]))
        detailed_placeList.append((checkList[i][4]))
    return idList, itemList, placeList, detailed_placeList

def sortColumn(res):
    dictForm = json.loads(res)
    condition_cols = []
    condition_vals = []
    for key, value in dictForm.items():
        if value != '':
            condition_cols.append(key)
            condition_vals.append(value)
    return condition_cols, condition_vals
