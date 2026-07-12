    try {
      const res = await API.post('/ai/chat', {
        messages: newMessages,
        systemPrompt: buildSystemPrompt(),
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      const errMsg  = err.response?.data?.message || '';
      const errCode = err.response?.data?.code    || '';
      const status  = err.response?.status;

      if (
        status === 401 ||
        errCode === 'NO_API_KEY' ||
        errCode === 'INVALID_API_KEY' ||
        errMsg.toLowerCase().includes('api key') ||
        errMsg.toLowerCase().includes('not configured')
      ) {
        setApiError('no_key');
        // Remove the user message that failed
        setMessages(prev => prev.slice(0, -1));
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: `⚠️ Error: ${errMsg || 'Something went wrong. Please try again.'}`,
          },
        ]);
      }
    } finally {
      setLoading(false);
    }