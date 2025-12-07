import React, { useEffect, useRef, useState } from 'react';

// Define ScenarioState locally since types aren't exported yet
type ScenarioState = 'idle' | 'running' | 'paused' | 'completed';

// Dynamic import for AnimFlow to optimize bundle size
// @ts-ignore - @animflow/core types not built yet
const loadAnimFlow = () => import('@animflow/core').then(mod => mod.AnimFlow);

interface AnimFlowEmbedProps {
  id: string;
  title?: string;
  height?: number;
  yaml: string;
}

interface AnimFlowComponentState {
  status: 'loading' | 'ready' | 'playing' | 'error';
  error?: string;
  currentScenario?: string;
  speed: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnimFlowInstance = any;

export default function AnimFlowEmbed({ title, height = 400, yaml }: AnimFlowEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animflowRef = useRef<AnimFlowInstance>(null);

  const [state, setState] = useState<AnimFlowComponentState>({
    status: 'loading',
    speed: 1,
  });

  const [scenarios, setScenarios] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear container
    containerRef.current.innerHTML = '';

    let isMounted = true;

    // Dynamic import for bundle optimization
    loadAnimFlow()
      .then((AnimFlow) => {
        if (!isMounted || !containerRef.current) return;

        try {
          // Create AnimFlow instance
          // Note: yaml-parser.ts in @animflow/core handles YAML indentation fixing
          const animflow = new AnimFlow({
            container: containerRef.current,
            source: yaml.trim(),
            format: 'yaml',
            autoRender: true,
            showControls: false,
            showProgress: true,
          });

          animflowRef.current = animflow;

          // Get scenarios
          const diagramScenarios = animflow.getScenarios();
          setScenarios(diagramScenarios);

          // Listen to state changes
          animflow.on('state:change', (payload: { state: ScenarioState }) => {
            const scenarioState = payload.state;
            if (scenarioState === 'running') {
              setState((prev) => ({ ...prev, status: 'playing' }));
            } else if (scenarioState === 'idle' || scenarioState === 'completed') {
              setState((prev) => ({ ...prev, status: 'ready' }));
            }
          });

          setState({
            status: 'ready',
            speed: 1,
            currentScenario: diagramScenarios[0]?.id,
          });
        } catch (err) {
          console.error('AnimFlow initialization error:', err);
          setState({
            status: 'error',
            error: err instanceof Error ? err.message : 'Unknown error occurred',
            speed: 1,
          });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load AnimFlow:', err);
        setState({
          status: 'error',
          error: 'Failed to load AnimFlow library',
          speed: 1,
        });
      });

    return () => {
      isMounted = false;
      animflowRef.current?.destroy();
      animflowRef.current = null;
    };
  }, [yaml]);

  const handlePlay = async () => {
    if (!animflowRef.current || !state.currentScenario) return;

    try {
      animflowRef.current.setSpeed(state.speed);
      await animflowRef.current.runScenario(state.currentScenario);
    } catch (err) {
      console.error('Error running scenario:', err);
    }
  };

  const handleStop = () => {
    animflowRef.current?.stopScenario();
  };

  const handleReset = () => {
    animflowRef.current?.stopScenario();
    animflowRef.current?.reset();
    setState((prev) => ({ ...prev, status: 'ready' }));
  };

  const handleSpeedChange = (newSpeed: number) => {
    setState((prev) => ({ ...prev, speed: newSpeed }));
    animflowRef.current?.setSpeed(newSpeed);
  };

  const handleScenarioChange = (scenarioId: string) => {
    handleReset();
    setState((prev) => ({ ...prev, currentScenario: scenarioId }));
  };

  if (state.status === 'error') {
    return (
      <div className="animflow-error" style={styles.error}>
        <div style={styles.errorIcon}>!</div>
        <div style={styles.errorTitle}>AnimFlow Error</div>
        <pre style={styles.errorMessage}>{state.error}</pre>
      </div>
    );
  }

  return (
    <div className="animflow-embed" style={styles.container}>
      {title && <div style={styles.title}>{title}</div>}

      <div
        ref={containerRef}
        style={{ ...styles.canvasContainer, height: `${height}px` }}
      />

      <div style={styles.controls}>
        <div style={styles.controlsLeft}>
          {state.status === 'playing' ? (
            <button onClick={handleStop} style={styles.button}>
              Stop
            </button>
          ) : (
            <button onClick={handlePlay} style={styles.button} disabled={state.status === 'loading'}>
              Play
            </button>
          )}
          <button onClick={handleReset} style={styles.button}>
            Reset
          </button>
        </div>

        <div style={styles.controlsCenter}>
          {scenarios.length > 1 && (
            <select
              value={state.currentScenario}
              onChange={(e) => handleScenarioChange(e.target.value)}
              style={styles.select}
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div style={styles.controlsRight}>
          <label style={styles.speedLabel}>Speed:</label>
          <select
            value={state.speed}
            onChange={(e) => handleSpeedChange(Number(e.target.value))}
            style={styles.select}
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    border: '1px solid var(--color-border, #e9ecef)',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '1.5rem',
    backgroundColor: 'var(--color-bg, #fff)',
  },
  title: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid var(--color-border, #e9ecef)',
    fontWeight: 600,
    fontSize: '0.875rem',
    color: 'var(--color-text, #1a1a2e)',
  },
  canvasContainer: {
    width: '100%',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    borderTop: '1px solid var(--color-border, #e9ecef)',
    backgroundColor: 'var(--color-bg-secondary, #f8f9fa)',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  controlsLeft: {
    display: 'flex',
    gap: '0.5rem',
  },
  controlsCenter: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
  },
  controlsRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  button: {
    padding: '0.5rem 1rem',
    border: '1px solid var(--color-border, #e9ecef)',
    borderRadius: '4px',
    backgroundColor: 'var(--color-bg, #fff)',
    color: 'var(--color-text, #1a1a2e)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 150ms ease',
  },
  select: {
    padding: '0.5rem 0.75rem',
    border: '1px solid var(--color-border, #e9ecef)',
    borderRadius: '4px',
    backgroundColor: 'var(--color-bg, #fff)',
    color: 'var(--color-text, #1a1a2e)',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  speedLabel: {
    fontSize: '0.875rem',
    color: 'var(--color-text-secondary, #6c757d)',
  },
  error: {
    border: '1px solid #dc3545',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    backgroundColor: '#fff5f5',
    textAlign: 'center' as const,
  },
  errorIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#dc3545',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '0 auto 1rem',
  },
  errorTitle: {
    fontWeight: 600,
    color: '#dc3545',
    marginBottom: '0.5rem',
  },
  errorMessage: {
    fontSize: '0.875rem',
    color: '#666',
    whiteSpace: 'pre-wrap' as const,
    textAlign: 'left' as const,
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    borderRadius: '4px',
    overflow: 'auto',
    maxHeight: '200px',
  },
};
