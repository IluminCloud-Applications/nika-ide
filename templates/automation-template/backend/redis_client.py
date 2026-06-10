import os
from functools import lru_cache


@lru_cache(maxsize=1)
def get_redis():
    """Cliente Redis (lazy). Use para cache, filas e estado de automações.

    Ex.: get_redis().set("chave", "valor"); get_redis().get("chave")
    """
    import redis

    url = os.getenv("REDIS_URL", "redis://redis:6379/0")
    return redis.from_url(url, decode_responses=True)
