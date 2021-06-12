redis-server ./redis/6380/redis.conf
redis-server ./redis/6381/redis.conf
redis-server ./redis/6382/redis.conf
redis-server ./redis/6383/redis.conf
redis-server ./redis/6384/redis.conf
redis-server ./redis/6385/redis.conf

redis-server -p 6383 --slaveof 127.0.0.1 6380
redis-server -p 6384 --slaveof 127.0.0.1 6381
redis-server -p 6385 --slaveof 127.0.0.1 6382

echo "yes" | redis-cli --cluster create \
	127.0.0.1:6380 \
	127.0.0.1:6381 \
	127.0.0.1:6382 \
	127.0.0.1:6383 \
	127.0.0.1:6384 \
	127.0.0.1:6385 \
	--cluster-replicas 1
