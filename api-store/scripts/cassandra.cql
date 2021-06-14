CREATE KEYSPACE sendify WITH replication = {'class': 'SimpleStrategy', 'replication_factor' : 1};
USE sendify;
CREATE TABLE channels (
    id varint,
    name varchar,
    PRIMARY KEY(id)
);
CREATE TABLE messages (
    channel_id varint,
    id varint,
    user_id varint,
    type varchar,
    content text,
    PRIMARY KEY((channel_id), id)
) WITH CLUSTERING ORDER BY (id DESC);