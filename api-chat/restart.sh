ps -ef | grep redis | grep -v grep | awk '{print $2}' | xargs kill -9
npm stop

redis-server ./redis/6380/redis.conf
redis-server ./redis/6381/redis.conf
redis-server ./redis/6382/redis.conf
redis-server ./redis/6383/redis.conf
redis-server ./redis/6384/redis.conf
redis-server ./redis/6385/redis.conf

npm start
