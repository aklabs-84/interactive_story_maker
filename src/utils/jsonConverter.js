/**
 * JSON 변환 유틸리티 - 레거시 형식(nodes/links)을 현재 앱 형식으로 변환
 */

export const jsonConverter = {
  /**
   * 외부 JSON을 앱의 스토리 형식으로 변환
   */
  convertToAppFormat(jsonData) {
    if (this.isAppFormat(jsonData)) {
      return jsonData;
    }

    if (this.isNodesLinksFormat(jsonData)) {
      return this.convertNodesLinksFormat(jsonData);
    }

    throw new Error('지원하지 않는 JSON 형식입니다.');
  },

  isAppFormat(data) {
    return data && data.nodes && typeof data.nodes === 'object' && !Array.isArray(data.nodes);
  },

  isNodesLinksFormat(data) {
    return data && Array.isArray(data.nodes) && Array.isArray(data.links);
  },

  convertNodesLinksFormat(data) {
    const { nodes, links } = data;

    // 시작 노드 찾기
    let startNode = nodes.find(n => n.id === 'S1' || n.id === 'start' || n.id.toLowerCase().includes('start'));
    if (!startNode) {
      const targetIds = new Set(links.map(l => l.target));
      startNode = nodes.find(n => !targetIds.has(n.id));
    }
    if (!startNode) startNode = nodes[0];

    const outgoingLinks = {};
    links.forEach(link => {
      if (!outgoingLinks[link.source]) outgoingLinks[link.source] = [];
      outgoingLinks[link.source].push(link);
    });

    const story = {
      id: `story-${Date.now()}`,
      metadata: {
        title: data.title || '불러온 스토리',
        author: data.author || '익명',
        description: data.description || '레거시 형식에서 변환된 스토리입니다.',
        theme: 'christmas',
        createdAt: new Date().toISOString()
      },
      nodes: {},
      startNodeId: 'start'
    };

    // 시작 노드 변환 시작
    this.convertNode(startNode, 'start', nodes, outgoingLinks, story);

    return story;
  },

  convertNode(node, newId, allNodes, outgoingLinks, story) {
    if (story.nodes[newId]) return;

    const childLinks = outgoingLinks[node.id] || [];
    const isEnding = childLinks.length === 0;

    if (isEnding) {
      story.nodes[newId] = {
        id: newId,
        text: node.content || node.title || '이야기가 끝났습니다.',
        image: '',
        isEnding: true,
        ending: {
          title: node.title || '엔딩',
          message: node.content || '이야기가 끝났습니다.',
          type: 'neutral'
        }
      };
    } else {
      story.nodes[newId] = {
        id: newId,
        text: node.content || node.title || '이야기가 계속됩니다.',
        image: '',
        choices: [],
        isEnding: false,
        ending: { title: '', message: '', type: 'neutral' }
      };

      childLinks.forEach((link, index) => {
        const targetNode = allNodes.find(n => n.id === link.target);
        if (targetNode) {
          const childId = `node-${targetNode.id}`;
          story.nodes[newId].choices.push({
            label: link.label || `선택지 ${index + 1}`,
            nextId: childId,
            letter: index === 0 ? 'a' : 'b'
          });
          this.convertNode(targetNode, childId, allNodes, outgoingLinks, story);
        }
      });
    }
  }
};
