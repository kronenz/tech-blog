/**
 * AnimFlow YAML Validator Service
 * 마크다운에서 AnimFlow 블록 추출 및 YAML 유효성 검증
 */

import yaml from 'js-yaml';
import type { AnimFlowBlock, ValidationResult } from '../types/editor';

/**
 * 마크다운 문서에서 AnimFlow 코드 블록 추출
 */
const ANIMFLOW_BLOCK_REGEX = /```animflow\n([\s\S]*?)```/g;

/**
 * AnimFlow YAML 블록을 마크다운에서 추출
 * @param content - 마크다운 문서 내용
 * @returns AnimFlow 블록 배열 (위치 정보 포함)
 */
export function extractAnimFlowBlocks(content: string): AnimFlowBlock[] {
  const blocks: AnimFlowBlock[] = [];
  let match: RegExpExecArray | null;
  let index = 0;

  // Reset regex state
  ANIMFLOW_BLOCK_REGEX.lastIndex = 0;

  while ((match = ANIMFLOW_BLOCK_REGEX.exec(content)) !== null) {
    const yamlContent = match[1];
    const startOffset = match.index;
    const endOffset = match.index + match[0].length;

    // 라인 번호 계산
    const beforeMatch = content.substring(0, startOffset);
    const startLine = beforeMatch.split('\n').length;
    const endLine = startLine + match[0].split('\n').length - 1;

    // YAML 유효성 검증
    const validation = validateAnimFlowYaml(yamlContent);

    blocks.push({
      id: `animflow-block-${index}`,
      yaml: yamlContent,
      startLine,
      endLine,
      isValid: validation.isValid,
      errors: validation.errors,
    });

    index++;
  }

  return blocks;
}

/**
 * AnimFlow YAML 문법 유효성 검증
 * @param yamlContent - YAML 문자열
 * @returns 검증 결과 (유효성, 오류 목록)
 */
export function validateAnimFlowYaml(yamlContent: string): ValidationResult {
  const errors: string[] = [];

  // 1. 기본 YAML 파싱 검증
  let parsed: unknown;
  try {
    parsed = yaml.load(yamlContent);
  } catch (e) {
    const err = e as yaml.YAMLException;
    return {
      isValid: false,
      errors: [`YAML 파싱 오류 (라인 ${err.mark?.line ?? '?'}): ${err.reason || err.message}`],
    };
  }

  // 빈 YAML 체크
  if (!parsed || typeof parsed !== 'object') {
    return {
      isValid: false,
      errors: ['YAML 내용이 비어있거나 유효한 객체가 아닙니다.'],
    };
  }

  const config = parsed as Record<string, unknown>;

  // 2. 필수 필드 검증
  if (!config.version) {
    errors.push('필수 필드 누락: version');
  }

  if (!config.nodes || !Array.isArray(config.nodes)) {
    errors.push('필수 필드 누락: nodes (배열)');
  } else if (config.nodes.length === 0) {
    errors.push('nodes 배열은 최소 1개 이상의 노드가 필요합니다.');
  } else {
    // 노드 유효성 검증
    const nodeIds = new Set<string>();
    (config.nodes as Array<Record<string, unknown>>).forEach((node, idx) => {
      if (!node.id) {
        errors.push(`nodes[${idx}]: 필수 필드 누락 - id`);
      } else {
        // ID 형식 검증
        const id = String(node.id);
        if (!/^[a-z][a-z0-9-]*$/.test(id)) {
          errors.push(`nodes[${idx}]: ID 형식 오류 - "${id}" (소문자, 숫자, 하이픈만 허용, 소문자로 시작)`);
        }
        if (nodeIds.has(id)) {
          errors.push(`nodes[${idx}]: 중복 ID - "${id}"`);
        }
        nodeIds.add(id);
      }

      if (!node.label) {
        errors.push(`nodes[${idx}]: 필수 필드 누락 - label`);
      }

      if (!node.position || typeof node.position !== 'object') {
        errors.push(`nodes[${idx}]: 필수 필드 누락 - position`);
      } else {
        const pos = node.position as Record<string, unknown>;
        if (typeof pos.x !== 'number' || pos.x < 0) {
          errors.push(`nodes[${idx}]: position.x는 0 이상의 숫자여야 합니다.`);
        }
        if (typeof pos.y !== 'number' || pos.y < 0) {
          errors.push(`nodes[${idx}]: position.y는 0 이상의 숫자여야 합니다.`);
        }
      }

      // 노드 타입 검증
      if (node.type) {
        const validTypes = ['box', 'circle', 'database', 'icon', 'group'];
        if (!validTypes.includes(String(node.type))) {
          errors.push(`nodes[${idx}]: 유효하지 않은 type - "${node.type}" (허용: ${validTypes.join(', ')})`);
        }
      }
    });

    // 엣지 참조 검증
    if (config.edges && Array.isArray(config.edges)) {
      const edgeIds = new Set<string>();
      (config.edges as Array<Record<string, unknown>>).forEach((edge, idx) => {
        if (!edge.id) {
          errors.push(`edges[${idx}]: 필수 필드 누락 - id`);
        } else {
          const id = String(edge.id);
          if (edgeIds.has(id)) {
            errors.push(`edges[${idx}]: 중복 ID - "${id}"`);
          }
          edgeIds.add(id);
        }

        if (!edge.from) {
          errors.push(`edges[${idx}]: 필수 필드 누락 - from`);
        } else if (!nodeIds.has(String(edge.from))) {
          errors.push(`edges[${idx}]: 존재하지 않는 노드 참조 - from: "${edge.from}"`);
        }

        if (!edge.to) {
          errors.push(`edges[${idx}]: 필수 필드 누락 - to`);
        } else if (!nodeIds.has(String(edge.to))) {
          errors.push(`edges[${idx}]: 존재하지 않는 노드 참조 - to: "${edge.to}"`);
        }
      });
    }

    // 시나리오 검증
    if (config.scenarios && Array.isArray(config.scenarios)) {
      const scenarioIds = new Set<string>();
      (config.scenarios as Array<Record<string, unknown>>).forEach((scenario, idx) => {
        if (!scenario.id) {
          errors.push(`scenarios[${idx}]: 필수 필드 누락 - id`);
        } else {
          const id = String(scenario.id);
          if (scenarioIds.has(id)) {
            errors.push(`scenarios[${idx}]: 중복 ID - "${id}"`);
          }
          scenarioIds.add(id);
        }

        if (!scenario.steps || !Array.isArray(scenario.steps)) {
          errors.push(`scenarios[${idx}]: 필수 필드 누락 - steps (배열)`);
        } else {
          // 스텝 검증
          validateSteps(scenario.steps as Array<Record<string, unknown>>, idx, nodeIds, scenarioIds, errors);
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 시나리오 스텝 배열 검증
 */
function validateSteps(
  steps: Array<Record<string, unknown>>,
  scenarioIdx: number,
  nodeIds: Set<string>,
  scenarioIds: Set<string>,
  errors: string[]
): void {
  const validActions = [
    'highlight',
    'animate-edge',
    'update-stat',
    'log',
    'delay',
    'conditional',
    'goto',
    'parallel',
    'reset',
  ];

  steps.forEach((step, stepIdx) => {
    const prefix = `scenarios[${scenarioIdx}].steps[${stepIdx}]`;

    if (!step.action) {
      errors.push(`${prefix}: 필수 필드 누락 - action`);
      return;
    }

    const action = String(step.action);
    if (!validActions.includes(action)) {
      errors.push(`${prefix}: 유효하지 않은 action - "${action}" (허용: ${validActions.join(', ')})`);
    }

    // 액션별 추가 검증
    switch (action) {
      case 'highlight':
        if (step.nodes && Array.isArray(step.nodes)) {
          (step.nodes as string[]).forEach((nodeId, nIdx) => {
            if (!nodeIds.has(nodeId)) {
              errors.push(`${prefix}.nodes[${nIdx}]: 존재하지 않는 노드 - "${nodeId}"`);
            }
          });
        }
        break;

      case 'goto':
        if (!step.scenario) {
          errors.push(`${prefix}: goto 액션에 필수 - scenario`);
        } else if (!scenarioIds.has(String(step.scenario))) {
          errors.push(`${prefix}: 존재하지 않는 시나리오 - "${step.scenario}"`);
        }
        break;

      case 'conditional':
        if (!step.condition) {
          errors.push(`${prefix}: conditional 액션에 필수 - condition`);
        }
        if (step.then && Array.isArray(step.then)) {
          validateSteps(step.then as Array<Record<string, unknown>>, scenarioIdx, nodeIds, scenarioIds, errors);
        }
        if (step.else && Array.isArray(step.else)) {
          validateSteps(step.else as Array<Record<string, unknown>>, scenarioIdx, nodeIds, scenarioIds, errors);
        }
        break;

      case 'parallel':
        if (!step.steps || !Array.isArray(step.steps)) {
          errors.push(`${prefix}: parallel 액션에 필수 - steps (배열)`);
        } else {
          validateSteps(step.steps as Array<Record<string, unknown>>, scenarioIdx, nodeIds, scenarioIds, errors);
        }
        break;
    }

    // duration 검증
    if (step.duration !== undefined && typeof step.duration === 'number' && step.duration <= 0) {
      errors.push(`${prefix}: duration은 0보다 커야 합니다.`);
    }
  });
}

/**
 * YAML 문자열이 유효한 AnimFlow 형식인지 빠르게 체크
 * (전체 검증보다 가벼움)
 */
export function isValidAnimFlowYaml(yamlContent: string): boolean {
  try {
    const parsed = yaml.load(yamlContent) as Record<string, unknown>;
    return Boolean(
      parsed &&
      typeof parsed === 'object' &&
      parsed.version &&
      Array.isArray(parsed.nodes) &&
      parsed.nodes.length > 0
    );
  } catch {
    return false;
  }
}

/**
 * 검증 오류를 사용자 친화적인 메시지로 변환
 */
export function formatValidationErrors(errors: string[]): string {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  return `${errors.length}개의 오류:\n${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}`;
}
