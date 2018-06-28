import uuid
import decimal
import datetime

try: 
    import simplejson as json
except ImportError: 
    import json

import flask


def nice_json_encoder(base_encoder):

    class JSONEncoder(base_encoder):
        """
        JSONEncoder subclass that knows how to encode date/time, decimal types, and UUIDs.
        See: https://stackoverflow.com/questions/11875770/how-to-overcome-datetime-datetime-not-json-serializable
        """
        def default(self, o):
            # See "Date Time String Format" in the ECMA-262 specification.
            if isinstance(o, datetime.datetime):
                r = o.isoformat()
                if o.microsecond:
                    r = r[:23] + r[26:]
                if r.endswith('+00:00'):
                    r = r[:-6] + 'Z'
                return r
            elif isinstance(o, datetime.date):
                return o.isoformat()
            elif isinstance(o, datetime.time):
                if o.utcoffset() is not None:
                    raise ValueError("JSON can't represent timezone-aware times.")
                r = o.isoformat()
                if o.microsecond:
                    r = r[:12]
                return r
            elif isinstance(o, (decimal.Decimal, uuid.UUID)):
                return str(o)
            elif isinstance(o, bytes):  
                return str(o, encoding='utf-8')
            else:
                return super(JSONEncoder, self).default(o)

    return JSONEncoder


sysJSONEncoder = nice_json_encoder(json.JSONEncoder)
flaskJSONEnCoder = nice_json_encoder(flask.json.JSONEncoder)

