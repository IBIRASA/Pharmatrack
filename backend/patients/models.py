from mongoengine import Document, StringField, FloatField, DictField
from datetime import datetime

class Pharmacy(Document):
    user_id = StringField(required=True) 
    name = StringField(required=True)
    address = StringField(required=True)
    phone = StringField()
    latitude = FloatField(required=True)
    longitude = FloatField(required=True)
    inventory = DictField()  
    meta = {'collection': 'pharmacies'}
