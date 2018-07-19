"""
A Cache Interface
TODO: Add support for redis
"""

import os
from werkzeug.contrib.cache import SimpleCache, FileSystemCache
from . import SERVER_ROOT


class Cache:
    def __init__(self):
        self._cache = {}

    def set(self, key, value):
        self._cache[key] = value

    def get(self, key):
        return self._cache.get(key, None)

    def has(self, key):
        return key in self._cache

    def delete(self, *keys):
        count = 0
        for key in keys:
            if key in self.has(key):
                del self._cache[key]
                count += 1
        return count


# The simpleCache uses pickle to dump and loads object. Thus we cannot store a process object in the cache
# TODO: Find a better way to manage the processes
# __cache = SimpleCache(default_timeout=0)

# __cache = Cache()
# This might be slow, but the cache system is safe
__cache = FileSystemCache(default_timeout=0, cache_dir=os.path.join(SERVER_ROOT, '../.atm_server_cache'))


def get_cache():
    return __cache
