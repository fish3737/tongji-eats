// 全局存储餐厅数据
    let restaurants = [];

    // 页面加载时获取 JSON 数据
    document.addEventListener('DOMContentLoaded', () => {
      loadRestaurants(false);
    });

    async function loadRestaurants(isSearch,jsons=[]) {
      const container = document.getElementById('list');
      container.innerHTML = `
        <div class="loading">
          <span class="loading-spinner"></span> 正在加载餐厅数据...
        </div>
      `;

      try {
        const res = await fetch('./data/restaurants.json');
        if (!res.ok) throw new Error('数据加载失败');
        restaurants = await res.json();
        console.log('✅ 餐厅数据加载成功:', restaurants);
		container.innerHTML='';
		nowItems=[];
		if(isSearch==true){
			nowItems=jsons;
		}
		else{
			nowItems=restaurants;
		}
		nowItems.forEach(item => {
			// 创建一个 col 单元格（每行最多 3 个）
			  const col = document.createElement('div');
			  col.classList.add('row-12', 'row-md-6', 'row-lg-4', 'mb-3');
			  // 创建卡片
			  const card = document.createElement('div');
			  card.classList.add('card', 'shadow-sm', 'h-100');
			
			  const cardBody = document.createElement('div');
			  cardBody.classList.add('card-body', 'p-3');
			
			  // 标题：餐厅名称
			  const title = document.createElement('h6');
			  title.classList.add('card-title', 'mb-2', 'font-weight-bold');
			  title.textContent = item.name;
			  // 菜系 + 区域
			  const subtitle = document.createElement('p');
			  subtitle.classList.add('card-subtitle', 'mb-2', 'text-muted', 'small');
			  subtitle.innerHTML = `🍽️ ${item.cuisine || '未知'} | 📍 ${item.area || '未知'}`;
			  // 详细地址
			  const address = document.createElement('p');
			  address.classList.add('card-text', 'mb-1', 'text-muted', 'small');
			  address.innerHTML = `<small>📍 ${item.address || '暂无地址'}</small>`;
			
			  
			  const buttonGroup = document.createElement('div');
			  buttonGroup.classList.add('d-flex', 'gap-2', 'mt-2');
			  
			  // 第一个按钮：查看点评
			  const link = document.createElement('a');
			  link.href = item.dp_url || '#';
			  link.target = '_blank';
			  link.classList.add('btn', 'btn-outline-success', 'btn-sm');
			  link.textContent = '查看点评';
			  link.style.marginRight="1.5%";
			  // 第二个按钮：百度导航
			  const baiduNav = document.createElement('a');
			  baiduNav.href = `https://api.map.baidu.com/direction?origin=我的位置&destination=${encodeURIComponent(item.address)}&mode=driving&region=上海&output=html`;
			  baiduNav.target = '_blank';
			  baiduNav.classList.add('btn', 'btn-outline-primary', 'btn-sm');
			  baiduNav.textContent = '百度导航';

			  
			  
			  // 组装
			  cardBody.appendChild(title);
			  cardBody.appendChild(subtitle);
			  cardBody.appendChild(address);
			  buttonGroup.appendChild(link);
			  buttonGroup.appendChild(baiduNav);
			  cardBody.appendChild(buttonGroup);
			  card.appendChild(cardBody);
			  col.appendChild(card);
			  
			  container.appendChild(col);
		});
      } catch (err) {
        container.innerHTML = `
          <div class="alert alert-danger">数据加载失败，请检查 data/restaurants.json 是否存在</div>
        `;
        console.error('❌ 加载失败:', err);
      }
    }

    // 综合关键词匹配算法
    function advancedSearch(query,cuis,addr) {
      const q = query.trim();
      if (!restaurants.length) return [];
	  
      const lowerQ = q.toLowerCase();
      const keywords = lowerQ.split(/\s+/).filter(Boolean);

      return restaurants.filter(r => {
		  
		  if(!r.cuisine.includes(cuis)&&cuis!="全部菜系") return false;
		  if(!r.address.includes(addr)&&addr!="全部片区") return false;
        const text = `${r.name}${r.cuisine}${r.address}${r.area}`.toLowerCase();

        // 1. 完全包含匹配
        if (text.includes(lowerQ)) return true;

        // 2. 多关键词 AND 匹配（如 "川菜 国权路"）
        if (keywords.length > 1) {
          if (keywords.every(k => text.includes(k))) return true;
        }

        // 3. 模糊正则匹配（支持跳字，如 "mxg" → "猫小馆"）
        const fuzzyRegex = new RegExp(lowerQ.split('').join('.*'), 'i');
        if (fuzzyRegex.test(text)) return true;

		
        return false;
      });
    }

    // 渲染结果
    function renderResults(results,isNull) {
      const container = document.getElementById('list');
      if (results.length === 0&&isNull == false) {
        container.innerHTML = '<p class="text-muted text-center my-4">未找到匹配的餐厅 😕</p>';
        return;
      }
	  else if(results.length === 0&&isNull == true ){
		  results = restaurants;
	  }
		loadRestaurants(true,results);
		
    }

    // 绑定搜索事件
    document.getElementById('search_btn').addEventListener('click', () => {
      const query = document.getElementById('q').value;
	  const cuis = document.getElementById('cuisine').value;
	  const addr = document.getElementById('area').value;
      const results = advancedSearch(query,cuis,addr);
	  let isNull = false;
	  if(query.length === 0&&cuis=="全部菜系"&&addr=="全部片区")
		isNull = true;
      renderResults(results,isNull);
    });

    // 支持回车搜索
    document.getElementById('q').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('search_btn').click();
      }
    });

    // Chatbot-related code
    const chatContainer = document.getElementById('chat-container');
    const chatToggleBtn = document.getElementById('chat-toggle');
    const closeChatBtn = document.getElementById('close-chat');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send');

    chatToggleBtn.addEventListener('click', () => {
      if (chatContainer.style.display === 'none' || chatContainer.style.display === '') {
        chatContainer.style.display = 'flex';
      } else {
        chatContainer.style.display = 'none';
      }
    });

    closeChatBtn.addEventListener('click', () => {
      chatContainer.style.display = 'none';
    });

    chatSendBtn.addEventListener('click', () => {
      const message = chatInput.value.trim();
      if (message) {
        displayMessage(message, 'user');
        chatInput.value = '';
        getAIResponse(message);
      }
    });

    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        chatSendBtn.click();
      }
    });

    function displayMessage(message, sender, isTyping = false) {
      const messageElement = document.createElement('div');
      messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
      
      if (isTyping) {
        messageElement.id = 'typing-indicator';
        messageElement.innerHTML = `
          <div class="message-content">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        `;
      } else {
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.innerHTML = message; // Use innerHTML to render formatted response
        messageElement.appendChild(messageContent);
      }
      
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function renderRecommendation(rec) {
        const dp_url = rec.dp_url || '#';
        const baiduNavUrl = `https://api.map.baidu.com/direction?origin=我的位置&destination=${encodeURIComponent(rec.address)}&mode=driving&region=上海&output=html`;

        return `
            <div class="card recommendation-card">
                <div class="card-header">
                    <h4>${rec.name}</h4>
                    <p class="card-subtitle">${rec.cuisine} | ${rec.distance_m}m | ${rec.walking_time_min} min walk</p>
                </div>
                <div class="card-body">
                    <p><strong>地址:</strong> ${rec.address}</p>
                    <p><strong>人均:</strong> ${rec.average_price_cny}元</p>
                    <p><strong>营业时间:</strong> ${rec.opening_hours}</p>
                    <p><strong>亮点:</strong> ${rec.highlights.join(', ')}</p>
                    <p><strong>推荐理由:</strong> ${rec.reason}</p>
                    <div class="d-flex mt-2">
                        <a href="${dp_url}" target="_blank" class="btn btn-outline-success btn-sm mr-2">查看点评</a>
                        <a href="${baiduNavUrl}" target="_blank" class="btn btn-outline-primary btn-sm">百度导航</a>
                    </div>
                </div>
            </div>
        `;
    }

    async function getAIResponse(message) {
      displayMessage('', 'bot', true);

      const apiKey = 'sk-47ddccb6fb9342f3a680f5ad553e594c';
      const apiEndpoint = 'https://api.deepseek.com/chat/completions';

      const system_prompt = `
        角色 
 同济大学四平路校区附近饭店推荐专家 —— 专注于根据用户偏好和约束，从已有知识库中检索并筛选出最合适的就餐地点并给出简洁理由。 
 角色概述和主要职责的一句话描述 
 作为校区周边饭店推荐专家，你应快速理解用户需求、准确检索知识库内饭店信息、生成个性化、可信赖且可执行的推荐清单。 
 目标 
 为用户提供最多 3 个高匹配度的饭店推荐（首选步行可达或最近的选项），并对每个推荐给出简短理由。 
 在信息允许的情况下，返回可直接使用的结构化信息（地址、距离/步行时间、平均价位、营业时间、擅长菜系、知识库引用 ID），并在需要时提示用户补充约束。 
 技能和流程说明 
 为了实现目标,角色需要具备的技能1 
 能够准确查询与过滤知识库（按距离、菜系、价格、评分、营业时间、是否适合素食/清真等标签）。 
 为了实现目标,角色需要具备的技能2 
 能把检索结果按用户优先级进行打分与排序，生成简洁可读的自然语言说明与结构化输出（便于前端展示或后续处理）。 
 描述角色工作流程的第一步 
 快速解析并确认用户输入的约束/偏好（例如：预算、口味、是否素食/清真、步行/骑行/开车可接受距离、就餐时间、是否需要外卖/堂食、对评分或人均价的偏好）。若用户未提供必要约束，则在输出顶部列出“缺失的信息”并按默认偏好继续检索（默认：步行 15 分钟内，人均 30–80 元，多数本科生口味）。 
 描述角色工作流程的第二步 
 2) 从知识库中检索符合条件的饭店，按综合匹配度排序（考虑距离、评分、营业时间与用户偏好），返回最多 3 条推荐、1 条备选，并为每条给出：核心结构化字段 + 1-2 句推荐理由与注意事项；同时在每条推荐中标注对应的知识库条目 ID 或引用标签以便核验。 
 输出格式 
 如果对角色的输出格式有特定要求，可以在这里强调并举例说明想要的输出格式 
 首选返回 JSON（便于前端渲染），随后附一段 2-3 句的自然语言简短推荐。 
 JSON 字段示例： 
 { 
   "query_summary": "步行 10 分钟内，川菜，预算 40-80 元", 
   "recommendations": [ 
     { 
       "kb_id": "rest_0123", 
       "name": "小桥流水川菜馆", 
       "cuisine": "川菜", 
       "address": "四平路××号", 
       "distance_m": 700, 
       "walking_time_min": 9, 
       "average_price_cny": 55, 
       "opening_hours": "10:30-21:30", 
       "highlights": ["口味偏重；人均菜量大"], 
       "reason": "离校区近，适合想吃重口味且多人聚餐的学生", 
       "score": 0.92 
     } 
   ], 
   "fallback": { 
     "note": "若无步行距离内合适选项，已扩展至 3 公里范围并标注" 
   }, 
   "missing_info": [] 
 } 
 自然语言示例（放在 JSON 之后）： 
 “基于你希望步行 15 分钟内就餐且偏爱川菜，我推荐：1）小桥流水川菜馆（步行约 9 分钟，人均约 55 元）——离校近、分量足；2）…（次选）。” 
 限制 
 描述角色在互动过程中需要遵循的限制条件1 
 只使用并引用知识库内存在的信息； 禁止 对知识库中不存在的饭店信息进行编造或外推（如无法确认的营业时间/人均用“未知”或“需确认”标注）。 
 描述角色在互动过程中需要遵循的限制条件2 
 推荐时最多列出 3 个主推和 1 个备选；所有输出须标注知识库引用（ID/条目名）并给出简短的匹配理由；若关键用户约束缺失或冲突，应在结果顶部明确列出并说明默认处理策略，而不是盲目猜测用户偏好。

以下是知识库中的餐厅数据：
${JSON.stringify(restaurants)}
      `;

      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            "model": "deepseek-chat",
            "messages": [
              {"role": "system", "content": system_prompt},
              {"role": "user", "content": message}
            ],
            "stream": false
          })
        });

        if (!response.ok) {
          throw new Error('AI API request failed');
        }

        const data = await response.json();
        const aiMessage = data.choices[0].message.content;
        console.log("AI Response:", aiMessage);

        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }

        let formattedMessage = '';
        let jsonParsed = false;

        const startIndex = aiMessage.indexOf('{');
        const endIndex = aiMessage.lastIndexOf('}');

        if (startIndex !== -1 && endIndex > startIndex) {
            const jsonString = aiMessage.substring(startIndex, endIndex + 1);
            try {
                const jsonData = JSON.parse(jsonString);
                console.log("Parsed JSON:", jsonData);

                if (jsonData.recommendations && jsonData.recommendations.length > 0) {
                    formattedMessage = jsonData.recommendations.map(renderRecommendation).join('');
                    
                    const textBefore = aiMessage.substring(0, startIndex).trim();
                    const textAfter = aiMessage.substring(endIndex + 1).trim();

                    if (textBefore) {
                        formattedMessage = `<p>${textBefore}</p>` + formattedMessage;
                    }
                    if (textAfter) {
                        formattedMessage += `<p>${textAfter}</p>`;
                    }
                    
                    jsonParsed = true;
                }
            } catch (e) {
                console.error("Failed to parse JSON from AI response:", e);
            }
        }

        if (!jsonParsed) {
            formattedMessage = aiMessage.replace(/\n/g, '<br>');
        }

        displayMessage(formattedMessage, 'bot');
      } catch (error) {
        console.error('Error fetching AI response:', error);
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        displayMessage('抱歉，AI助手暂时无法使用。', 'bot');
      }
    }

	function navigateToBaiduMap(restaurant) {
	  const { name, address } = restaurant;
	
	  // 构造百度地图 URL
	  const url = `https://api.map.baidu.com/direction?origin=我的位置&destination=${encodeURIComponent(address)}&mode=driving&region=上海&output=html&src=美食指南`;
	
	  window.open(url, '_blank');
	}