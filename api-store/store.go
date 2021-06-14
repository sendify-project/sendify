package main

import (
	"context"
	"errors"
	"os"

	"github.com/gocql/gocql"
	"github.com/sony/sonyflake"
)

var (
	cassandraHost     string = os.Getenv("CASSANDRA_HOST")
	cassandraUser     string = os.Getenv("CASSANDRA_USER")
	cassandraPassword string = os.Getenv("CASSANDRA_PASSWORD")

	sf      *sonyflake.Sonyflake
	session *gocql.Session
)

type Channel struct {
	ID   uint64 `json:"id"`
	Name string `json:"name" binding:"required"`
}

type Message struct {
	ChannelID uint64 `json:"channel_id" binding:"required"`
	ID        uint64 `json:"id"`
	UserID    uint64 `json:"user_id" binding:"required"`
	Type      string `json:"type" binding:"required"`
	Content   string `json:"content" binding:"required"`
}

func init() {
	var err error
	sf, err = newSonyFlake()
	if err != nil {
		panic(err)
	}

	cluster := gocql.NewCluster(cassandraHost)
	cluster.RetryPolicy = &gocql.SimpleRetryPolicy{
		NumRetries: 3,
	}
	cluster.Keyspace = "sendify"
	cluster.Consistency = gocql.Quorum
	cluster.Authenticator = gocql.PasswordAuthenticator{
		Username: cassandraUser,
		Password: cassandraPassword,
	}
	session, err = cluster.CreateSession()
	if err != nil {
		panic(err)
	}
}

func createChannel(ctx context.Context, channel *Channel) error {
	id, err := sf.NextID()
	if err != nil {
		return err
	}
	channel.ID = id
	if err := session.Query("INSERT INTO channels (id, name) VALUES (?, ?)",
		channel.ID,
		channel.Name).WithContext(ctx).Exec(); err != nil {
		return err
	}
	return nil
}

func listChannels(ctx context.Context) ([]*Channel, error) {
	var channels []*Channel
	scanner := session.Query(`SELECT id, name FROM channels`).WithContext(ctx).Iter().Scanner()
	for scanner.Next() {
		var (
			id   uint64
			name string
		)
		err := scanner.Scan(&id, &name)
		if err != nil {
			return nil, err
		}
		channels = append(channels, &Channel{
			ID:   id,
			Name: name,
		})
	}
	if err := scanner.Err(); err != nil {
		return nil, err
	}
	return channels, nil
}

func createMessage(ctx context.Context, message *Message) error {
	id, err := sf.NextID()
	if err != nil {
		return err
	}
	message.ID = id
	if err := session.Query("INSERT INTO messages (channel_id, id, user_id, type, content) VALUES (?, ?, ?, ?, ?)",
		message.ChannelID,
		message.ID,
		message.UserID,
		message.Type,
		message.Content).WithContext(ctx).Exec(); err != nil {
		return err
	}
	return nil
}

func listMessages(ctx context.Context, channelID uint64) ([]*Message, error) {
	var messages []*Message
	scanner := session.Query(`SELECT id, user_id, type, content FROM messages WHERE channel_id = ?`, channelID).WithContext(ctx).Iter().Scanner()
	for scanner.Next() {
		var (
			id      uint64
			userID  uint64
			msgType string
			content string
		)
		err := scanner.Scan(&id, &userID, &msgType, &content)
		if err != nil {
			return nil, err
		}
		messages = append(messages, &Message{
			ChannelID: channelID,
			ID:        id,
			UserID:    userID,
			Type:      msgType,
			Content:   content,
		})
	}
	if err := scanner.Err(); err != nil {
		return nil, err
	}
	return messages, nil
}

func newSonyFlake() (*sonyflake.Sonyflake, error) {
	var st sonyflake.Settings
	sf := sonyflake.NewSonyflake(st)
	if sf == nil {
		return nil, errors.New("sonyflake not created")
	}
	return sf, nil
}
