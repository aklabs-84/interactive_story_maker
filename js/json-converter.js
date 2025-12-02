// ==========================================
// JSON 변환 모듈 - 다양한 형식을 앱 형식으로 변환
// ==========================================

const JsonConverterModule = {
  /**
   * 외부 JSON을 앱의 스토리 형식으로 변환
   * @param {Object} jsonData - 외부 JSON 데이터
   * @returns {Object} 앱 형식의 스토리 객체
   */
  convertToAppFormat(jsonData) {
    // 이미 앱 형식인지 확인
    if (this.isAppFormat(jsonData)) {
      return jsonData;
    }

    // nodes/links 형식인지 확인
    if (this.isNodesLinksFormat(jsonData)) {
      return this.convertNodesLinksFormat(jsonData);
    }

    throw new Error('지원하지 않는 JSON 형식입니다. nodes/links 형식 또는 앱 형식만 지원됩니다.');
  },

  /**
   * 앱 형식인지 확인
   */
  isAppFormat(data) {
    return data.nodes && typeof data.nodes === 'object' &&
           data.startNodeId &&
           data.metadata;
  },

  /**
   * nodes/links 형식인지 확인
   */
  isNodesLinksFormat(data) {
    return Array.isArray(data.nodes) && Array.isArray(data.links);
  },

  /**
   * nodes/links 형식을 앱 형식으로 변환
   */
  convertNodesLinksFormat(data) {
    const { nodes, links } = data;

    console.log('[변환] nodes/links 형식 감지');
    console.log('[변환] 노드 수:', nodes.length);
    console.log('[변환] 링크 수:', links.length);

    // 시작 노드 찾기 (S1, start, 또는 source가 없는 첫 번째 노드)
    let startNode = nodes.find(n => n.id === 'S1' || n.id === 'start' || n.id.toLowerCase().includes('start'));
    if (!startNode) {
      // source가 없는 노드 찾기
      const targetIds = new Set(links.map(l => l.target));
      startNode = nodes.find(n => !targetIds.has(n.id));
    }
    if (!startNode) {
      startNode = nodes[0]; // 첫 번째 노드를 시작으로 사용
    }

    console.log('[변환] 시작 노드:', startNode.id, startNode.title);

    // 엔딩 노드 식별 (E_로 시작하거나 ending이 포함된 노드)
    const endingNodes = new Set(
      nodes
        .filter(n => n.id.startsWith('E_') || n.id.toLowerCase().includes('ending'))
        .map(n => n.id)
    );

    console.log('[변환] 엔딩 노드들:', Array.from(endingNodes));

    // 각 노드에서 나가는 링크 맵 생성
    const outgoingLinks = {};
    links.forEach(link => {
      if (!outgoingLinks[link.source]) {
        outgoingLinks[link.source] = [];
      }
      outgoingLinks[link.source].push(link);
    });

    // 앱 형식으로 변환
    const story = {
      id: `story-${Date.now()}`,
      metadata: {
        title: data.title || '불러온 스토리',
        author: data.author || '익명',
        description: data.description || '외부에서 불러온 스토리입니다.',
        theme: 'fantasy',
        createdAt: new Date().toISOString()
      },
      nodes: {},
      startNodeId: 'start'
    };

    // 시작 노드 생성
    story.nodes['start'] = {
      id: 'start',
      type: 'story',
      emoji: '⭐',
      text: startNode.content || startNode.title || '스토리가 시작됩니다.',
      image: '',
      choices: []
    };

    // 시작 노드의 선택지들 추가
    const startLinks = outgoingLinks[startNode.id] || [];
    console.log('[변환] 시작 노드의 선택지 수:', startLinks.length);

    startLinks.forEach((link, index) => {
      const targetNode = nodes.find(n => n.id === link.target);
      if (targetNode) {
        const choiceNodeId = `choice-${targetNode.id}`;
        story.nodes['start'].choices.push({
          label: link.label || `선택지 ${index + 1}`,
          emoji: index === 0 ? '⭐' : '💫',
          nextId: choiceNodeId
        });

        // 재귀적으로 노드 변환
        this.convertNode(targetNode, choiceNodeId, nodes, links, outgoingLinks, endingNodes, story);
      }
    });

    console.log('[변환] 최종 변환된 노드 수:', Object.keys(story.nodes).length);
    console.log('[변환] 변환 완료된 스토리:', story);

    return story;
  },

  /**
   * 개별 노드를 재귀적으로 변환
   */
  convertNode(node, nodeId, allNodes, allLinks, outgoingLinks, endingNodes, story) {
    // 이미 변환된 노드는 스킵
    if (story.nodes[nodeId]) {
      return;
    }

    // 엔딩 노드 확인: E_로 시작하거나 나가는 링크가 없는 노드
    const hasOutgoingLinks = outgoingLinks[node.id] && outgoingLinks[node.id].length > 0;
    const isEnding = endingNodes.has(node.id) || !hasOutgoingLinks;

    if (isEnding) {
      // 엔딩 노드
      story.nodes[nodeId] = {
        id: nodeId,
        type: 'ending',
        emoji: '🏁',
        text: node.content || node.title || '이야기가 끝났습니다.',
        image: '',
        ending: {
          title: node.title || '엔딩',
          message: node.content || '이야기가 끝났습니다.',
          type: this.guessEndingType((node.title || '') + ' ' + (node.content || '')),
          image: ''
        }
      };
    } else {
      // 스토리 노드
      story.nodes[nodeId] = {
        id: nodeId,
        type: 'story',
        emoji: '⭐',
        text: node.content || node.title || '이야기가 계속됩니다.',
        image: '',
        choices: []
      };

      // 하위 선택지 추가
      const childLinks = outgoingLinks[node.id] || [];
      childLinks.forEach((link, index) => {
        const targetNode = allNodes.find(n => n.id === link.target);
        if (targetNode) {
          const childNodeId = `choice-${targetNode.id}`;
          story.nodes[nodeId].choices.push({
            label: link.label || `선택지 ${index + 1}`,
            emoji: index === 0 ? '⭐' : '💫',
            nextId: childNodeId
          });

          // 재귀 호출
          this.convertNode(targetNode, childNodeId, allNodes, allLinks, outgoingLinks, endingNodes, story);
        }
      });
    }
  },

  /**
   * 엔딩 타입 추측
   */
  guessEndingType(text) {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('happy') || lowerText.includes('해피') || lowerText.includes('행복')) {
      return 'happy';
    }
    if (lowerText.includes('sad') || lowerText.includes('새드') || lowerText.includes('슬픔') || lowerText.includes('비극')) {
      return 'sad';
    }

    return 'neutral';
  },

  /**
   * JSON 파일 파싱 및 검증
   */
  parseJsonFile(fileContent) {
    try {
      console.log('[변환] JSON 파싱 시작');
      const jsonData = JSON.parse(fileContent);
      console.log('[변환] JSON 파싱 성공', jsonData);

      const result = this.convertToAppFormat(jsonData);
      console.log('[변환] 변환 완료', result);

      return result;
    } catch (error) {
      console.error('[변환 오류]', error);
      throw new Error('JSON 파싱 실패: ' + error.message);
    }
  }
};
