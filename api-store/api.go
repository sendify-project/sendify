package main

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

var (
	// ErrInvalidParam is invalid parameter error
	ErrInvalidParam = errors.New("invalid parameter")
	// ErrUnautorized is unauthorized error
	ErrUnautorized = errors.New("unauthorized")
	// ErrServer is server error
	ErrServer = errors.New("server error")
)

// ErrResponse is the error response type
type ErrResponse struct {
	Message string `json:"msg"`
}

// SuccessMessage is the success response type
type SuccessMessage struct {
	Message string `json:"msg" example:"ok"`
}

// OkMsg is the default success response for 200 status code
var OkMsg SuccessMessage = SuccessMessage{
	Message: "ok",
}

type Channels struct {
	Channels []*Channel `json:"channels"`
}

type Messages struct {
	Messages []*Message `json:"messages"`
}

func CreateChannel(c *gin.Context) {
	var channel Channel
	if err := c.ShouldBindJSON(&channel); err != nil {
		response(c, http.StatusBadRequest, ErrInvalidParam)
		return
	}
	err := createChannel(c.Request.Context(), &channel)
	switch err {
	case nil:
		c.JSON(http.StatusCreated, OkMsg)
		return
	default:
		logger.ContextLogger.Error(err.Error())
		response(c, http.StatusInternalServerError, ErrServer)
		return
	}
}

func DeleteChannel(c *gin.Context) {
	id := c.Param("id")
	channelID, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		response(c, http.StatusBadRequest, ErrInvalidParam)
		return
	}
	err = deleteChannel(c.Request.Context(), channelID)
	switch err {
	case nil:
		c.JSON(http.StatusNoContent, OkMsg)
		return
	default:
		logger.ContextLogger.Error(err.Error())
		response(c, http.StatusInternalServerError, ErrServer)
		return
	}
}

func ListChannels(c *gin.Context) {
	channels, err := listChannels(c.Request.Context())
	switch err {
	case nil:
		c.JSON(http.StatusOK, Channels{
			Channels: channels,
		})
		return
	default:
		logger.ContextLogger.Error(err.Error())
		response(c, http.StatusInternalServerError, ErrServer)
		return
	}
}

func CreateMessage(c *gin.Context) {
	var message Message
	if err := c.ShouldBindJSON(&message); err != nil {
		response(c, http.StatusBadRequest, ErrInvalidParam)
		return
	}
	err := createMessage(c.Request.Context(), &message)
	switch err {
	case nil:
		c.JSON(http.StatusCreated, OkMsg)
		return
	default:
		logger.ContextLogger.Error(err.Error())
		response(c, http.StatusInternalServerError, ErrServer)
		return
	}
}

func ListMessages(c *gin.Context) {
	channelID, err := strconv.ParseUint(c.Query("channel-id"), 10, 64)
	if err != nil {
		response(c, http.StatusBadRequest, ErrInvalidParam)
		return
	}
	messages, err := listMessages(c.Request.Context(), channelID)
	switch err {
	case nil:
		c.JSON(http.StatusOK, Messages{
			Messages: messages,
		})
		return
	default:
		logger.ContextLogger.Error(err.Error())
		response(c, http.StatusInternalServerError, ErrServer)
		return
	}
}

func response(c *gin.Context, httpCode int, err error) {
	message := err.Error()
	c.JSON(httpCode, ErrResponse{
		Message: message,
	})
}
