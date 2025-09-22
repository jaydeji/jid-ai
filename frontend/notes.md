fix formatting

- [ ] clear text after submitting
- [ ]loop 1-5 in python and tell me what it will print
- [ ]
- [ ]
  rehype and remark plugins

# sync issue

I use the same component for rendering streamed chats
It may or not have an id path
if it doesnt then its assumed its a new chat so there will be no messages
When i send a new message, an id is gotten from the backend, path is updated and the messages are streamed to display seamlessly
When I click a chat on nav bar, data is undefined and the loaded into the initial messages
My main problem is that there is no guarantee the messages are done storing in the db

How can you optimistically update a components and chats when youre not sure what has chaged
