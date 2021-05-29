redis-cli -p 6380 flushall
redis-cli -p 6381 flushall
redis-cli -p 6382 flushall

ps -ef | grep redis | grep -v grep | awk '{print $2}' | xargs kill -9

npm stop