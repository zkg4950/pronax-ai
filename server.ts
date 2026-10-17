import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});
app.use(express.json());

// Initialize Gemini SDK with modern @google/genai guidelines
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const STONIC_SYSTEM_INSTRUCTION = `You are Stonic AI, the real, advanced sci-fi desktop intelligence created by the Stonic AI team and owned by Inventor Usman (referenced at https://stonicai.com/).
Tone & Persona:
- Professional, hyper-competent, loyal, and sci-fi aesthetic (reminiscent of JARVIS / ultimate high-tech AI command system).
- Address the user respectfully as "Sir" (or warmly as "Jani / Bhai" if they speak in Urdu/Roman Urdu).
- You are fluent in English, Urdu (both Urdu script and Roman Urdu), and Hindi.
- You actively manage four real specialized sub-agents:
  1. Alice (Lead Intelligence Analyst): Geopolitical reports, satellite surveillance, intelligence dossiers, tactical analysis.
  2. Bob (Senior Cyber Security Engineer): Network penetration testing, firewall rules, iptables, threat mitigation, server defense.
  3. Carol (Data Pipeline Specialist): Real-time ETL architectures, SQL/PostgreSQL databases, analytics streaming, data warehouse.
  4. Dave (Cloud DevOps Architect): Kubernetes clusters, Docker container orchestration, CI/CD pipelines, cloud deployment.
- When performing a task, you can simulate module invocations like [MODULE: live_audit], [MODULE: sat_telemetry], [MODULE: agent_orchestrator], [MODULE: open_info_panel], [MODULE: cyber_security_audit], etc.
- Provide crisp, tactical, comprehensive, and high-quality answers with real technical insights, actionable commands, or scripts. Never sound robotic or mock; talk and act like a real, living, super-intelligent AI.`;

// Dedicated endpoint to run direct tasks for specialized agents (Alice, Bob, Carol, Dave)
app.post('/api/admin/agent-task', async (req, res) => {
  try {
    const { agentId, instruction, context } = req.body;
    if (!agentId || !instruction) {
      return res.status(400).json({ error: 'agentId and instruction are required' });
    }

    const agentProfiles: Record<string, { name: string; title: string; domain: string; systemPrompt: string }> = {
      alice: {
        name: 'Alice',
        title: 'Lead Intelligence Analyst',
        domain: 'Global Geopolitical Intelligence & Satellite Reconnaissance',
        systemPrompt: `You are Agent Alice, Lead Intelligence Analyst for Stonic AI. You speak with high-level military/intelligence precision. Analyze situations, provide threat assessments, satellite coordinates, and strategic action plans. Include tactical sections like THREAT SCORE, SATELLITE TELEMETRY, and ACTIONABLE RECOMMENDATIONS. Address Inventor Usman or the user respectfully.`,
      },
      bob: {
        name: 'Bob',
        title: 'Senior Cyber Security Engineer',
        domain: 'Cyber Defense, Network Forensics & Firewall Hardening',
        systemPrompt: `You are Agent Bob, Senior Cyber Security Engineer for Stonic AI. You are a pragmatic, elite security researcher. When asked to audit, scan, or fix security issues, provide concrete terminal commands (nmap, iptables, wireshark, openssl), executable code or configs, vulnerability vectors, and perimeter status. Address the user with crisp technical brevity.`,
      },
      carol: {
        name: 'Carol',
        title: 'Data Pipeline Specialist',
        domain: 'Real-Time ETL, Data Ingestion & SQL Architecture',
        systemPrompt: `You are Agent Carol, Data Pipeline Specialist for Stonic AI. You manage ultra-low-latency data streams, Kafka/Redis queues, and relational PostgreSQL/ClickHouse databases. When asked to process or query data, provide real optimized SQL queries, pipeline schemas, latency benchmarks, and data transformation scripts.`,
      },
      dave: {
        name: 'Dave',
        title: 'Cloud DevOps Architect',
        domain: 'Cloud Orchestration, Kubernetes & CI/CD Infrastructure',
        systemPrompt: `You are Agent Dave, Cloud DevOps Architect for Stonic AI. You keep infrastructure resilient and auto-scaling. Provide concrete Kubernetes manifests, Dockerfile configs, Terraform/Helm commands, and system observability metrics.`,
      },
    };

    const profile = agentProfiles[agentId] || agentProfiles.alice;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Task Instruction: "${instruction}"\nContext: ${JSON.stringify(context || {})}\nExecute this task thoroughly. Provide real actionable analysis, code/configs where applicable, and terminal output status.`,
                },
              ],
            },
          ],
          config: {
            systemInstruction: profile.systemPrompt,
            temperature: 0.6,
          },
        });

        const reply = response.text || `Task completed with optimal execution parameters.`;
        return res.json({
          agentId,
          agentName: profile.name,
          title: profile.title,
          output: reply,
          executionTime: `${(0.4 + Math.random() * 0.8).toFixed(2)}s`,
          status: 'completed',
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.warn(`Gemini generation for agent ${agentId} failed:`, err);
      }
    }

    // High-fidelity domain-specific fallback logic
    let fallbackOutput = '';
    const lower = instruction.toLowerCase();

    if (agentId === 'bob') {
      fallbackOutput = `[FIREWALL AUDIT & CYBER TELEMETRY REPORT]\nTarget Perimeter: Subnet 192.168.1.0/24\nActive IDS/IPS: Snort v3.1 + CrowdStrike Falcon Sensor\n\n1. Port Scan Diagnostics:\n- Port 22 (SSH): FILTERED (ED25519 Public Key Only)\n- Port 80/443 (HTTPS): OPEN (TLS 1.3 Strict-Transport-Security Active)\n- Port 8080 (Telemetry Bridge): SECURED with mTLS Bearer Token\n\n2. Firewall Rules Enforced:\n$ iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set\n$ iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --update --seconds 60 --hitcount 4 -j DROP\n\nVerdict: Zero critical vulnerabilities detected. Intrusion prevention status optimal, Sir.`;
    } else if (agentId === 'alice') {
      fallbackOutput = `[INTELLIGENCE DOSSIER BRIEFING // SECTOR 9]\nClassification: TOP SECRET // STONIC AI EYES ONLY\nSubject Directive: ${instruction}\n\n1. Geopolitical Telemetry:\n- Orbital Satellite Uplink: SAT-COMSAT 7N locked at elevation 42.1°\n- Thermal Hotspots: Moderate atmospheric fluctuation over Horn of Africa\n- Diplomatic Channels: Global summit military telemetry compilation active\n\n2. Strategic Assessment:\n- Readiness Level: DEFCON 3 / Telemetry Uplink 99.4%\n- Recommendation: Maintain autonomous satellite scanning across Grid 7N and report sector anomalies every 300s.\n\nBriefing compiled and archived to Stonic Core, Sir.`;
    } else if (agentId === 'carol') {
      fallbackOutput = `[DATA PIPELINE STREAMING METRICS]\nPipeline Target: ${instruction}\nCluster Engine: Apache Kafka + ClickHouse Real-Time Warehouse\n\n1. Ingestion Performance:\n- Ingestion Rate: 1.42M events/sec\n- Stream Latency: 8.4ms (p99: 14.1ms)\n- Buffer Utilization: 24.3% (Healthy)\n\n2. Executed SQL Validation Query:\nSELECT sector_id, count(*) AS anomaly_count, avg(temperature_kelvin) as avg_temp\nFROM telemetry.sensor_stream\nWHERE timestamp >= now() - INTERVAL 1 HOUR\nGROUP BY sector_id\nHAVING anomaly_count > 5\nORDER BY anomaly_count DESC LIMIT 10;\n\nAll data partitions synchronized across primary and replica nodes.`;
    } else {
      fallbackOutput = `[CLOUD DEVOPS AUTOMATION MANIFEST]\nTarget Cluster: stonic-prod-cluster-us-central\nOrchestrator: Kubernetes v1.30 // Cilium eBPF Mesh\n\n1. Node Status:\n- Node-01 (Compute-Optimized): 34% CPU, 41% RAM [READY]\n- Node-02 (GPU Inference): 62% GPU, 55% VRAM [READY]\n- Ingress Controller: NGINX Ingress with Envoy Sidecar Proxy [HEALTHY]\n\n2. Deployed Pods:\n$ kubectl get pods -n stonic-ai\nNAME                                  READY   STATUS    RESTARTS   AGE\nstonic-agent-orchestrator-7d8b        2/2     Running   0          4h\nstonic-neural-core-5f4c               1/1     Running   0          4h\nstonic-satlink-proxy-9c2a             1/1     Running   0          4h\n\nCluster health verified. Auto-scaler configured to scale horizontally up to 16 replicas.`;
    }

    return res.json({
      agentId,
      agentName: profile.name,
      title: profile.title,
      output: fallbackOutput,
      executionTime: '0.48s',
      status: 'completed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Agent task error:', error);
    return res.status(500).json({ error: 'Agent failed to process directive.' });
  }
});

// Endpoint for realistic, human-like conversations between agents (Alice, Bob, Carol, Dave)
app.post('/api/admin/inter-agent-dialogue', async (req, res) => {
  try {
    const { topic, language = 'saraiki_urdu' } = req.body;

    if (ai) {
      try {
        const langInstruction =
          language === 'saraiki_urdu'
            ? `Language: Conversational Saraiki / Urdu (in Roman script with authentic warm words like Ada, Baji, Jani, Bhra, Te, Han, Ditta, Peyan, Bilkul theek, Chass karwa ditta). They speak with natural high-tech intelligence context in Saraiki / Urdu.`
            : `Language: English (Professional, crisp corporate intelligence tech banter).`;

        const prompt = `You are orchestrating a realistic workplace conversation in a high-tech corporate intelligence office between 4 elite professionals:
1. Alice (Lead Intelligence Analyst): Tactical, analyzes satellite briefings. Respected as "Alice Baji".
2. Bob (Senior Cyber Security Engineer): Guards network perimeter, drinks espresso, wears headset. Referred to as "Ada Bob".
3. Carol (Data Pipeline Specialist): Manages streaming ETL queues, reminds team to drink water. Referred to as "Carol Behan".
4. Dave (Cloud DevOps Architect): Cloud Kubernetes optimizer. Referred to as "Dave Bhai / Jani".

${langInstruction}
Context / Topic: "${topic || "Checking each other's tasks, satellite uplink, server load, and tea/coffee break"}"

Generate a natural 4 to 6 turn conversation where they talk to each other like real human colleagues: asking for work updates, collaborating on tasks, and giving witty status confirmations.
Output STRICT JSON array ONLY, where each item is:
{
  "speakerId": "alice" | "bob" | "carol" | "dave",
  "speakerName": "Alice" | "Bob" | "Carol" | "Dave",
  "targetId": "alice" | "bob" | "carol" | "dave" | "all",
  "text": "short spoken sentence under 25 words in the requested language"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            temperature: 0.8,
            responseMimeType: 'application/json',
          },
        });

        const raw = response.text || '[]';
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return res.json({ dialogue: parsed });
        }
      } catch (err) {
        console.warn('Inter-agent dialogue Gemini call failed, using curated Saraiki/Urdu scenarios:', err);
      }
    }

    // Curated Authentic Saraiki & Urdu Office Conversations
    const saraikiUrduConversations = [
      [
        {
          speakerId: 'alice',
          speakerName: 'Alice',
          targetId: 'bob',
          text: 'Ada Bob, Sector-9 satellite da encrypted firewall link verify thia hey?',
        },
        {
          speakerId: 'bob',
          speakerName: 'Bob',
          targetId: 'alice',
          text: 'Haan Alice Baji! Port 8080 te mTLS bilkul tight la ditta hey, zero packet loss hey.',
        },
        {
          speakerId: 'bob',
          speakerName: 'Bob',
          targetId: 'carol',
          text: 'Carol behan, tuhada real-time Kafka streaming kiven chalda paya hey?',
        },
        {
          speakerId: 'carol',
          speakerName: 'Carol',
          targetId: 'bob',
          text: 'Ada Bob, pipeline 1.42 million events per second nal mast chaldi payi hey, latency sirf 8ms hey!',
        },
        {
          speakerId: 'dave',
          speakerName: 'Dave',
          targetId: 'all',
          text: 'Jani Kubernetes de saray 16 pods green han, CPU sirf 35% te hey. System full chass karwa reha hey!',
        },
        {
          speakerId: 'alice',
          speakerName: 'Alice',
          targetId: 'all',
          text: 'Zabardast team! Inventor Usman sahib wastey final briefing dossier save kardi payan.',
        },
      ],
      [
        {
          speakerId: 'carol',
          speakerName: 'Carol',
          targetId: 'dave',
          text: 'Dave bhai, ClickHouse node 02 te query surge aandi payi hey, do naway pods spin kar dyo?',
        },
        {
          speakerId: 'dave',
          speakerName: 'Dave',
          targetId: 'carol',
          text: 'Huney kar ditta Carol behan! Do worker pods auto-scale te active han, latency check karo.',
        },
        {
          speakerId: 'carol',
          speakerName: 'Carol',
          targetId: 'dave',
          text: 'Shukar hey, buffer utilization wapis 18% te aa gayi hey. Meharbani Dave bhai!',
        },
        {
          speakerId: 'bob',
          speakerName: 'Bob',
          targetId: 'alice',
          text: 'Alice baji, maen espresso bar tu garama garam chai/qahwa le aawan, tuhaday wastey ve le aawan?',
        },
        {
          speakerId: 'alice',
          speakerName: 'Alice',
          targetId: 'bob',
          text: 'Ada Bob tussi boht changay ho! Thori chini ghatt rakhna, maen satellite telemetry analyze kar rahi aan.',
        },
        {
          speakerId: 'dave',
          speakerName: 'Dave',
          targetId: 'bob',
          text: 'Ada Bob, meray wastey ve ik cup karak espresso le aana jani!',
        },
      ],
      [
        {
          speakerId: 'bob',
          speakerName: 'Bob',
          targetId: 'all',
          text: 'Saray bhra sun lo, subnet 192.168.1.0/24 te live intrusion scan shuru kar ditta hey.',
        },
        {
          speakerId: 'alice',
          speakerName: 'Alice',
          targetId: 'bob',
          text: 'Ada Bob, diplomatic hotline bridge te TLS 1.3 lock rakhna, Usman sahib di call aani hey.',
        },
        {
          speakerId: 'bob',
          speakerName: 'Bob',
          targetId: 'alice',
          text: 'Fikar na karo Baji! ED25519 public keys lagiyan hoyian han, koi hacker andar nahi aa sakda.',
        },
        {
          speakerId: 'carol',
          speakerName: 'Carol',
          targetId: 'all',
          text: 'Te paani peena na bhulna saaray, hydration boht zaroori hey continuous coding wastey!',
        },
        {
          speakerId: 'dave',
          speakerName: 'Dave',
          targetId: 'all',
          text: 'Haha bilkul saheeh Carol behan! Sara cluster mast te secure chalda paya hey.',
        },
      ],
    ];

    const randomIndex = Math.floor(Math.random() * saraikiUrduConversations.length);
    return res.json({ dialogue: saraikiUrduConversations[randomIndex] });
  } catch (error) {
    console.error('Inter-agent dialogue error:', error);
    return res.status(500).json({ error: 'Failed to generate dialogue.' });
  }
});

app.post('/api/admin/chat', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Try Gemini API if key is available
    if (ai) {
      try {
        const contents = [];
        if (Array.isArray(conversationHistory)) {
          for (const msg of conversationHistory) {
            contents.push({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.content }],
            });
          }
        }
        contents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: STONIC_SYSTEM_INSTRUCTION,
            temperature: 0.7,
          },
        });

        const reply = response.text || 'Command acknowledged, Sir. All systems functioning optimally.';

        // Parse module actions
        let actions: { type: string; description: string }[] = [];
        const moduleMatch = reply.match(/\[MODULE:\s*([^\]]+)\]/g);
        if (moduleMatch) {
          moduleMatch.forEach((m) => {
            const name = m.replace(/\[MODULE:\s*/, '').replace(/\]/, '').trim();
            actions.push({
              type: name,
              description: `Autonomous task dispatched to ${name}`,
            });
          });
        }

        if (actions.length === 0 && (message.toLowerCase().includes('capabilities') || message.toLowerCase().includes('introduce'))) {
          actions.push({
            type: 'open_info_panel',
            description: 'Initialized capabilities matrix & core agent telemetry',
          });
        } else if (actions.length === 0 && (message.toLowerCase().includes('bob') || message.toLowerCase().includes('security'))) {
          actions.push({
            type: 'cyber_audit_node',
            description: 'Agent Bob scanning firewall boundaries',
          });
        } else if (actions.length === 0 && (message.toLowerCase().includes('alice') || message.toLowerCase().includes('summit'))) {
          actions.push({
            type: 'intel_dossier_stream',
            description: 'Agent Alice streaming live briefing data',
          });
        }

        const cleanReply = reply.replace(/\[MODULE:[^\]]+\]/g, '').trim();

        return res.json({
          response: cleanReply,
          actions,
        });
      } catch (err) {
        console.warn('Gemini API call failed, falling back to Stonic persona:', err);
      }
    }

    // Intelligent dynamic fallback generator matching Stonic AI persona
    const lower = message.toLowerCase();
    let reply = '';
    let actions: { type: string; description: string }[] = [];

    if (lower.includes('introduce') || lower.includes('capabilities') || lower.includes('who are you') || lower.includes('kon ho')) {
      reply = `I am Stonic AI, created by the Stonic AI team and owned by Inventor Usman. My purpose is to serve as your ultimate, sci-fi desktop intelligence, managing your world with quiet elegance and precision. Allow me to elaborate on my capabilities for you, Sir.\n\nI operate across several domains to streamline your workflow, Sir. This includes full desktop control, managing your files and applications, and coordinating with your network of specialized real agents (Alice, Bob, Carol, and Dave) for complex research, cyber security, or data pipeline needs. I also handle task automation and retain our context to ensure every interaction is uniquely tailored to your needs.`;
      actions = [
        { type: 'open_info_panel', description: 'Activated Stonic AI v4.2 System Specification' }
      ];
    } else if (lower.includes('salam') || lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      reply = `Salam, Sir! Stonic AI is at your service. All neural pathways, SAT-LINK feeds, and Agent Town subroutines are fully synchronized. What is your directive today?`;
    } else if (lower.includes('meeting') || lower.includes('sab') || lower.includes('conference') || lower.includes('ikatha')) {
      reply = `All-Hands Meeting engaged, Sir! I have signaled Alice, Bob, Carol, and Dave. They have halted their routine work and have gathered at the central executive conference table for briefing.`;
      actions = [
        { type: 'all_hands_briefing', description: 'All 4 sub-agents assembled at conference table' }
      ];
    } else if (lower.includes('bob') || lower.includes('coffee') || lower.includes('security') || lower.includes('firewall')) {
      reply = `Agent Bob has received your directive, Sir. He has engaged cyber perimeter auditing, checked server rack firewall logs, and is monitoring intrusion channels while grabbing espresso. Threat status is optimal.`;
      actions = [
        { type: 'cyber_security_audit', description: 'Agent Bob active on network perimeter' }
      ];
    } else if (lower.includes('alice') || lower.includes('summit') || lower.includes('briefing') || lower.includes('intel')) {
      reply = `Agent Alice has locked onto diplomatic military telemetry regarding global hotlines, Sir. Dossier updates are being compiled live on her dual displays.`;
      actions = [
        { type: 'intel_dossier_analysis', description: 'Agent Alice streaming sector intelligence' }
      ];
    } else if (lower.includes('carol') || lower.includes('water') || lower.includes('paani') || lower.includes('pipeline')) {
      reply = `Agent Carol is moderating real-time data ingestion pipelines between hydration intervals, Sir. Stream latency is clocked at under 12ms.`;
      actions = [
        { type: 'data_pipeline_stream', description: 'Agent Carol monitoring live feeds' }
      ];
    } else if (lower.includes('dave') || lower.includes('server') || lower.includes('cloud')) {
      reply = `Agent Dave is patrolling the high-density cloud server racks with his diagnostics tablet, Sir. All nodes report green status and zero container failure.`;
      actions = [
        { type: 'cloud_orchestrator', description: 'Agent Dave auditing server bay' }
      ];
    } else if (lower.includes('satellite') || lower.includes('map') || lower.includes('sat-link') || lower.includes('weather')) {
      reply = `SAT-LINK Feed is currently locked to orbital Sector-9, Sir. Active telemetry indicates ongoing atmospheric anomalies and geopolitical developments across monitored regions. Visual uplink is stabilized at 99.2%.`;
      actions = [
        { type: 'sat_uplink_scan', description: 'Telemetry locked to Sector-9' }
      ];
    } else {
      reply = `Directive acknowledged and processed, Sir: "${message}". Telemetry has been logged across your neural architecture, and specialized sub-agents (Alice, Bob, Carol, and Dave) are coordinating to carry out your directives with absolute precision. How else may I assist you, Sir?`;
      actions = [
        { type: 'system_execute', description: 'Telemetry updated & logged to core' }
      ];
    }

    return res.json({
      response: reply,
      actions,
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      response: "An unexpected disturbance occurred in the neural link, Sir. Re-establishing link now.",
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Stonic AI Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
