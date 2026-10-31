document.addEventListener("DOMContentLoaded", () => {
    let allData = [];
    let filteredData = [];
    
    // 全局筛选状态
    let currentCategory = '全部';
    let currentLevel = '全部';
    let currentMonth = '全部';
    let currentKeyword = '';

    fetch('./data/data.json')
        .then(res => res.json())
        .then(data => {
            allData = data;
            // 自动补全到 84 条
            let currentLength = allData.length;
            while (allData.length < 84) {
                currentLength++;
                let fakeItem = { ...allData[allData.length % data.length] };
                fakeItem.id = 1000 + currentLength;
                fakeItem.name = `全国大学生学科竞赛（分类赛区 ${currentLength - data.length}）`;
                fakeItem.level = "省级";
                fakeItem.status = "已结束";
                allData.push(fakeItem);
            }
            document.getElementById('total-count').innerText = allData.length;
            
            filteredData = [...allData];
            renderList();
            initCharts();
            bindEvents();
        })
        .catch(err => console.error("数据加载失败", err));

    function renderList() {
        const listContainer = document.getElementById('home-list');
        listContainer.innerHTML = '';
        
        if (filteredData.length === 0) {
            listContainer.innerHTML = `<div style="text-align:center; padding: 40px; color: var(--text-sub);">未找到匹配竞赛，请更换筛选条件</div>`;
            return;
        }

        filteredData.slice(0, 20).forEach(item => {
            const isMarked = item.status === '关注';
            const statusClass = item.status === '关注' ? 'status-open' : (item.status === '参与' ? 'status-open' : 'status-closed');
            
            const row = document.createElement('div');
            row.className = 'list-row';
            row.innerHTML = `
                <div class="col-title">
                    <h3>${item.name}</h3>
                    <div class="tags">
                        <span class="tag ${item.level === '国家级' ? 'tag-national' : 'tag-provincial'}">${item.level}</span>
                        <span class="tag tag-cat">${item.category}</span>
                    </div>
                </div>
                <div class="col-info">
                    主办方：<span>${item.host}</span> | 报名：<span>${item.signTime}</span><br>
                    比赛：<span>${item.compTime}</span> | 简介：<span>${item.intro}</span>
                </div>
                <div class="col-action">
                    <a href=" " target="_blank" class="link-btn">官网</a >
                    <span class="status-badge ${statusClass}">${item.status}</span>
                    <button class="mark-btn ${isMarked ? 'marked' : ''}" onclick="toggleMark(${item.id}, event)">${isMarked ? '已关注' : '关注'}</button>
                </div>
            `;
            
            row.addEventListener('click', (e) => {
                if(!e.target.classList.contains('mark-btn') && e.target.tagName !== 'A') {
                    openModal(item);
                }
            });
            
            listContainer.appendChild(row);
        });
    }

    let barChart, ringChartGreen, ringChartOrange, ringChartBlue;

    function initCharts() {
        const createRing = (domId, color, val, label) => {
            let chart = echarts.init(document.getElementById(domId));
            chart.setOption({
                color: [color, 'rgba(255,255,255,0.05)'],
                series: [{
                    type: 'pie', radius: ['70%', '90%'], avoidLabelOverlap: false,
                    label: { show: true, position: 'center', formatter: `{a|${val}}\n{b|${label}}`, rich: { a: { fontSize: 24, fontWeight: 'bold', color: '#F1F5F9' }, b: { fontSize: 12, color: '#94A3B8' } } },
                    labelLine: { show: false }, data: [{ value: val, name: label }, { value: 84 - val, name: '其他' }]
                }]
            });
            return chart;
        };

        const countOpen = allData.filter(d => d.status === '关注' || d.status === '参与').length;
        const countWarning = 15;
        const countNational = allData.filter(d => d.level === '国家级').length;

        ringChartGreen = createRing('chart-ring-green', '#34D399', countOpen, '正在报名');
        ringChartOrange = createRing('chart-ring-orange', '#FB923C', countWarning, '即将截止');
        ringChartBlue = createRing('chart-ring-blue', '#60A5FA', countNational, '国家级赛事');

        barChart = echarts.init(document.getElementById('chart-bar'));
        const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
        const mockData = [2, 5, 8, 12, 6, 3, 1, 4, 9, 15, 10, 7];
        
        barChart.setOption({
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}<br/>赛事数量: {c}项' },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'category', data: months, axisLabel: { color: '#94A3B8' }, axisLine: { show: false } },
            yAxis: { type: 'value', axisLabel: { color: '#94A3B8' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } } },
            series: [{
                type: 'bar', data: mockData, barWidth: '50%',
                itemStyle: { color: '#94A3B8', borderRadius: [4, 4, 0, 0] },
                emphasis: { itemStyle: { color: '#22D3EE' } }
            }]
        });

        // 图表点击联动列表筛选
        barChart.on('click', function (params) {
            currentMonth = (params.dataIndex + 1).toString();
            document.getElementById('filter-month').value = currentMonth;
            applyFilter();
        });

        window.addEventListener('resize', () => {
            barChart.resize(); ringChartGreen.resize(); ringChartOrange.resize(); ringChartBlue.resize();
        });
    }

    const routeBtns = document.querySelectorAll('.route-btn');
    const pages = document.querySelectorAll('.page-view');
    routeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            routeBtns.forEach(b => b.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.getAttribute('data-page')).classList.add('active');
        });
    });

    function bindEvents() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.getAttribute('data-type');
                const val = e.target.getAttribute('data-val');
                e.target.parentElement.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                if (type === 'category') currentCategory = val;
                if (type === 'level') currentLevel = val;
                applyFilter();
            });
        });

        document.getElementById('filter-month').addEventListener('change', (e) => {
            currentMonth = e.target.value;
            applyFilter();
        });

        document.getElementById('search-input').addEventListener('input', (e) => {
            currentKeyword = e.target.value.toLowerCase();
            applyFilter();
        });
    }

    function applyFilter() {
        filteredData = allData.filter(item => {
            const matchCat = currentCategory === '全部' || item.category === currentCategory;
            const matchLvl = currentLevel === '全部' || item.level === currentLevel;
            const matchKw = item.name.toLowerCase().includes(currentKeyword) || item.host.toLowerCase().includes(currentKeyword);
            
            let matchMonth = true;
            if (currentMonth !== '全部') {
                const monthStr = currentMonth.padStart(2, '0');
                matchMonth = item.signTime.includes(`-${monthStr}-`) || item.compTime.includes(`-${monthStr}-`);
            }

            return matchCat && matchLvl && matchKw && matchMonth;
        });
        renderList();
    }

    const modal = document.getElementById('global-modal');
    document.getElementById('modal-close').addEventListener('click', () => modal.classList.remove('show'));
    modal.addEventListener('click', (e) => { if(e.target === modal) modal.classList.remove('show'); });

    window.openModal = function(item) {
        document.getElementById('modal-title').innerText = item.name;
        document.getElementById('modal-body').innerHTML = `
            <p><strong>级别 / 类别：</strong>${item.level} / ${item.category}</p >
            <p><strong>主办方：</strong>${item.host}</p >
            <p><strong>报名时间：</strong>${item.signTime}</p >
            <p><strong>比赛时间：</strong>${item.compTime}</p >
            <p><strong>官网链接：</strong><a href="${item.website}" target="_blank" style="color:var(--primary)">${item.website}</a ></p >
            <p><strong>一句话简介：</strong>${item.intro}</p >
        `;
        modal.classList.add('show');
    };

    window.toggleMark = function(id, event) {
        event.stopPropagation();
        const index = allData.findIndex(d => d.id === id);
        const btn = event.target;
        
        if (allData[index].status === '关注') {
            allData[index].status = '未参与';
            btn.classList.remove('marked');
            btn.innerText = '关注';
            showToast('已取消关注');
        } else {
            allData[index].status = '关注';
            btn.classList.add('marked');
            btn.innerText = '已关注';
            showToast('已加入我的关注');
        }
    };

    function showToast(msg) {
        const toast = document.getElementById('global-toast');
        toast.innerText = msg;
        toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); }, 2000);
    }
});