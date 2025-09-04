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
	
	function navigateToBaiduMap(restaurant) {
	  const { name, address } = restaurant;
	
	  // 构造百度地图 URL
	  const url = `https://api.map.baidu.com/direction?origin=我的位置&destination=${encodeURIComponent(address)}&mode=driving&region=上海&output=html&src=美食指南`;
	
	  window.open(url, '_blank');
	}