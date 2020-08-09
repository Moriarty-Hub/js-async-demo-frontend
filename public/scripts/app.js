(function(){
  function guessComplexity (message) {
    if (message.includes('not easy')) { return 2; }
    if (message.includes('easy')) { return 1; }
    if (message.includes('complex')) { return 3; }
    if (message.includes('difficult')) { return 4; }
    if (message.includes('hardcore')) { return 5; }
    if (message.includes('hell')) { return 6; }
    return 0;
  }

  function sendMessageAndWait (message, success, failure) {
    postRequestSync(
      'http://localhost:3000/api/message', 
      { text: message, complexity: guessComplexity(message) },
      xhr => success(JSON.parse(xhr.responseText).text),
      xhr => failure(xhr.statusText)
    );
  }
  
  function sendMessageAsync (message, success, failure) {
    postRequestAsync(
      'http://localhost:3000/api/message', 
      { text: message, complexity: guessComplexity(message) },
      xhr => success(JSON.parse(xhr.responseText).text),
      xhr => failure(xhr.statusText)
    );
  }

  const chat = {
    messageToSend: '',
    messageResponses: [
      'Why did the web developer leave the restaurant? Because of the table layout.',
      'How do you comfort a JavaScript bug? You console it.',
      'An SQL query enters a bar, approaches two tables and asks: "May I join you?"',
      'What is the most used language in programming? Profanity.',
      'What is the object-oriented way to become wealthy? Inheritance.',
      'An SEO expert walks into a bar, bars, pub, tavern, public house, Irish pub, drinks, beer, alcohol'
    ],
    init: function() {
      this.cacheDOM();
      this.bindEvents();
    },
    cacheDOM: function() {
      this.$chatHistory = $('.chat-history');
      this.$sendAndWait = $('#send-and-wait');
      this.$sendAsync = $('#send-async');
      this.$clearHistory = $('#clear-history');
      this.$textarea = $('#message-to-send');
      this.$chatHistoryList = this.$chatHistory.find('ul');
    },
    bindEvents: function() {
      this.$sendAndWait.on('click', function () { this.sendMessage({isSync: true }); }.bind(this));
      this.$sendAsync.on('click', function () { this.sendMessage({isSync: false }); }.bind(this));
      this.$clearHistory.on('click', function () { this.$chatHistoryList.empty(); }.bind(this));
    },
    sendMessage: function (options) {
      const message = this.$textarea.val()
      if (message.trim() === '') { return; }
      this.renderMessage(message, { isResponse: false });
      this.$textarea.val('');
      this.scrollToBottom();

      const sendFunc = options.isSync ? sendMessageAndWait : sendMessageAsync;
      sendFunc(
        message, 
        messageResponse => { this.renderMessage(messageResponse, { isResponse: true, isError: false }); },
        messageResponse => { this.renderMessage(messageResponse, { isResponse: true, isError: true }); });
    },
    renderMessage: function (message, options) {
      const templateId = options.isResponse ? (options.isError ? "#error-response-template" : "#message-response-template") : "#message-template";
      const template = Handlebars.compile($(templateId).html());
      const context = { 
        response: message,
        time: this.getCurrentTime()
      };
      this.$chatHistoryList.append(template(context));
      this.scrollToBottom();
    },
    scrollToBottom: function() {
       this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
    },
    getCurrentTime: function() {
      return new Date().toLocaleTimeString().
              replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
    },
    getRandomItem: function(arr) {
      return arr[Math.floor(Math.random()*arr.length)];
    }
  };

  chat.init();
})();
