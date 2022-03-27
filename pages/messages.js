import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import baseUrl from "../utils/baseUrl";
import { parseCookies } from "nookies";
import { useRouter } from "next/router";
import { Segment, Header, Divider, Comment, Grid } from "semantic-ui-react";
import Chat from "../components/Chats/Chat";
import ChatListSearch from "../components/Chats/ChatListSearch";
import { NoMessages } from "../components/Layout/NoData";
import Banner from "../components/Messages/Banner";
import MessageInputField from "../components/Messages/MessageInputField";
import Message from "../components/Messages/Message";
import getUserInfo from "../utils/getUserInfo";
import newMsgSound from "../utils/newMsgSound";
import cookie from "js-cookie";

//scroll to bottom if new message has arrived
const scrollDivToBottom = divRef =>
  divRef.current !== null && divRef.current.scrollIntoView({ behaviour: "smooth" });

function Messages({ chatsData, user }) {
  const [chats, setChats] = useState(chatsData);
  const router = useRouter();

  const socket = useRef();
  const [connectedUsers, setConnectedUsers] = useState([]);

  const [messages, setMessages] = useState([]);
  const [bannerData, setBannerData] = useState({ name: "", profilePicUrl: "" });

  const divRef = useRef();

  // This ref is for persisting the state of query string in url throughout re-renders. 
  //This ref is the value of query string inside url
  const openChatId = useRef("");

  //CONNECTION useEffect
  useEffect(() => {
    //socket is ref and refs have current property on it.
    if (!socket.current) {
      //buy calling io we are connecting/initiationg  with server
      socket.current = io(baseUrl);
    }

//if we are connected 
    if (socket.current) {
      //join is event which will be emitted with userId object
      //this event has to be same name at the backend server.js file 
      socket.current.emit("join", { userId: user._id });

      socket.current.on("connectedUsers", ({ users }) => {
        //receiving connectedUsers from backend after every 10 seconds and here we are setting it
        users.length > 0 && setConnectedUsers(users);
      });

      if (chats.length > 0 && !router.query.message) {
        router.push(`/messages?message=${chats[0].messagesWith}`, undefined, {
          shallow: true
        });
      }
    }
    //disconnect event when we refresh or go back to home
    return () => {
      if (socket.current) {
        socket.current.emit("dis-connect");
        socket.current.off();
      }
    };
  }, []);

  // LOAD MESSAGES useEffect
  //so each time message query string is changed we emit event load messages
  //we are sending userId and message with user id
  useEffect(() => {
    const loadMessages = () => {
      socket.current.emit("loadMessages", {
        userId: user._id,
        messagesWith: router.query.message
      });
      //at the backend we are sending this event 
      socket.current.on("messagesLoaded", async ({ chat }) => {
        setMessages(chat.messages);
        setBannerData({
          name: chat.messagesWith.name,
          profilePicUrl: chat.messagesWith.profilePicUrl
        });

        openChatId.current = chat.messagesWith._id;
        divRef.current && scrollDivToBottom(divRef);
      });

      socket.current.on("noChatFound", async () => {
        const { name, profilePicUrl } = await getUserInfo(router.query.message);

        setBannerData({ name, profilePicUrl });
        setMessages([]);
        //setting the ref ..all ref have current property 
        openChatId.current = router.query.message;
      });
    };

    if (socket.current && router.query.message) loadMessages();
  }, [router.query.message]);

  //when send message button is clicked this function will emit event which wil we handle at backend
  const sendMsg = msg => {
    if (socket.current) {
      socket.current.emit("sendNewMsg", {
        userId: user._id,
        msgSendToUserId: openChatId.current,
        msg
      });
    }
  };

  // Confirming msg is sent and receving the messages useEffect
  useEffect(() => {
    //if msgsent is sent by server then spread prev and add new msg into set new user
    if (socket.current) {
      socket.current.on("msgSent", ({ newMsg }) => {
        if (newMsg.receiver === openChatId.current) {
          setMessages(prev => [...prev, newMsg]);

          setChats(prev => {
            //to set last msg in chat list
            const previousChat = prev.find(chat => chat.messagesWith === newMsg.receiver);
            previousChat.lastMessage = newMsg.msg;
            previousChat.date = newMsg.date;

            return [...prev];
          });
        }
      });

  
      socket.current.on("newMsgReceived", async ({ newMsg }) => {
        let senderName;

        // WHEN CHAT WITH SENDER IS CURRENTLY OPENED INSIDE YOUR BROWSER
        if (newMsg.sender === openChatId.current) {
          setMessages(prev => [...prev, newMsg]);

          
          setChats(prev => {
            const previousChat = prev.find(chat => chat.messagesWith === newMsg.sender);
            previousChat.lastMessage = newMsg.msg;
            previousChat.date = newMsg.date;

            senderName = previousChat.name;

            return [...prev];
          });
        }
        ////  when not opened find that chat and update last chat
        else {
          const ifPreviouslyMessaged =
            chats.filter(chat => chat.messagesWith === newMsg.sender).length > 0;

          if (ifPreviouslyMessaged) {
            setChats(prev => {
              const previousChat = prev.find(chat => chat.messagesWith === newMsg.sender);
              previousChat.lastMessage = newMsg.msg;
              previousChat.date = newMsg.date;

              senderName = previousChat.name;

              return [
                previousChat,
                ...prev.filter(chat => chat.messagesWith !== newMsg.sender)
              ];
            });
          }

          //IF NO PREVIOUS CHAT WITH THE SENDER
          else {
            const { name, profilePicUrl } = await getUserInfo(newMsg.sender);
            senderName = name;

            const newChat = {
              messagesWith: newMsg.sender,
              name,
              profilePicUrl,
              lastMessage: newMsg.msg,
              date: newMsg.date
            };
            setChats(prev => [newChat, ...prev]);
          }
        }

        newMsgSound(senderName);
      });
    }
  }, []);

  useEffect(() => {
    messages.length > 0 && scrollDivToBottom(divRef);
  }, [messages]);

  const deleteMsg = messageId => {
    if (socket.current) {
      socket.current.emit("deleteMsg", {
        userId: user._id,
        messagesWith: openChatId.current,
        messageId
      });

      socket.current.on("msgDeleted", () => {
        setMessages(prev => prev.filter(message => message._id !== messageId));
      });
    }
  };
  useEffect(() => {
    const messageRead = async () => {
      try {
        await axios.post(
          `${baseUrl}/api/chats`,
          {},
          { headers: { Authorization: cookie.get("token") } }
        );
      } catch (error) {
        console.log(error);
      }
    };

    messageRead();
  }, []);

  const deleteChat = async messagesWith => {
    try {
      await axios.delete(`${baseUrl}/api/chats/${messagesWith}`, {
        headers: { Authorization: cookie.get("token") }
      });

      setChats(prev => prev.filter(chat => chat.messagesWith !== messagesWith));
      router.push("/messages", undefined, { shallow: true });
    } catch (error) {
      alert("Error deleting chat");
    }
  };

  return (
    <>
      <Segment padded basic size="large" style={{ marginTop: "5px" }}>
      <a href="/">
          <Header icon="home" content="Go Back!" style={{ cursor: "pointer" }} />
        </a>
        <Divider hidden />

        <div style={{ marginBottom: "10px" }}>
          <ChatListSearch chats={chats} setChats={setChats} />
        </div>

        {chats.length > 0 ? (
          <>
            <Grid stackable>
              <Grid.Column width={4}>
                <Comment.Group size="big">
                  <Segment raised style={{ overflow: "auto", maxHeight: "32rem" }}>
                    {chats.map((chat, i) => (
                      <Chat
                        key={i}
                        chat={chat}
                        connectedUsers={connectedUsers}
                        deleteChat={deleteChat}
                      />
                    ))}
                  </Segment>
                </Comment.Group>
              </Grid.Column>

              <Grid.Column width={12}>
                {
                  //if there is message id query then only show this
                }
                {router.query.message && (
                  <>
                    <div
                      style={{
                        overflow: "auto",
                        overflowX: "hidden",
                        maxHeight: "35rem",
                        height: "35rem",
                        backgroundColor: "whitesmoke"
                      }}
                    >
                      <div style={{ position: "sticky", top: "0" }}>
                        <Banner bannerData={bannerData} />
                      </div>

                      {messages.length > 0 &&
                        messages.map((message, i) => (
                          <Message
                            divRef={divRef}
                            key={i}
                            bannerProfilePic={bannerData.profilePicUrl}
                            message={message}
                            user={user}
                            deleteMsg={deleteMsg}
                          />
                        ))}
                    </div>

                    <MessageInputField sendMsg={sendMsg} />
                  </>
                )}
              </Grid.Column>
            </Grid>
          </>
        ) : (
          <NoMessages />
        )}
      </Segment>
    </>
  );
}

Messages.getInitialProps = async ctx => {
  try {
    const { token } = parseCookies(ctx);

    const res = await axios.get(`${baseUrl}/api/chats`, {
      headers: { Authorization: token }
    });

    return { chatsData: res.data };
  } catch (error) {
    return { errorLoading: true };
  }
};

export default Messages;
