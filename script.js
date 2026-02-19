const examples = {
  armstrong: `#include <stdio.h>
int main() {
    int n, r, sum = 0, temp;
    printf("Enter a number: ");
    scanf("%d", &n);
    temp = n;
    while (n > 0) {
        r = n % 10;
        sum = sum + (r * r * r);
        n = n / 10;
    }
    if (temp == sum)
        printf("Armstrong Number");
    else
        printf("Not Armstrong Number");
    return 0;
}`,
  multiplication: `#include <stdio.h>
int main() {
    int n, i;
    printf("Enter an integer: ");
    scanf("%d", &n);
    for (i = 1; i <= 10; ++i) {
        printf("%d * %d = %d", n, i, n * i);
    }
    return 0;
}`,
  comparison: `#include <stdio.h>
int main() {
    int n1, n2, n3;
    printf("Enter three numbers: ");
    scanf("%d %d %d", &n1, &n2, &n3);
    if (n1 >= n2) {
        if (n1 >= n3)
            printf("n1 is largest");
        else
            printf("n3 is largest");
    } else {
        if (n2 >= n3)
            printf("n2 is largest");
        else
            printf("n3 is largest");
    }
    return 0;
}`,
};

function loadExample(type) {
  document.getElementById("codeInput").value = examples[type];
  generateFlowchart();
}

function generateFlowchart() {
  const code = document.getElementById("codeInput").value;
  if (!code.trim()) {
    alert("Please enter code");
    return;
  }

  try {
    const tokens = tokenize(code);
    const graph = parseToMermaid(tokens);
    render(graph);
  } catch (e) {
    console.error(e);
    document.getElementById(
      "flowchart-container"
    ).innerHTML = `<div style="color:red; padding:20px;">Error: ${e.message}</div>`;
  }
}

function render(graphDefinition) {
  const container = document.getElementById("flowchart-container");


  if (typeof mermaid !== "undefined") {
    container.innerHTML = `<div class="mermaid">${graphDefinition}</div>`;
    try {
      mermaid.init(undefined, container.querySelectorAll(".mermaid"));
    } catch (e) {
      console.error("Mermaid failed, trying fallback", e);
      renderFallback(graphDefinition);
    }
  } else {
    
    renderFallback(graphDefinition);
  }
}


function tokenize(code) {
  code = code.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
  const tokenPatterns = [
    {
      type: "KEYWORD",
      regex:
        /^(if|else|while|for|do|return|break|continue|int|float|void|char|double)\b/,
    },
    { type: "IO", regex: /^(printf|scanf|puts|gets)/ },
    { type: "ID", regex: /^[a-zA-Z_]\w*/ },
    { type: "NUMBER", regex: /^\d+(\.\d+)?/ },
    { type: "STRING", regex: /^"[^"]*"/ },
    { type: "OP", regex: /^(==|!=|<=|>=|&&|\|\||\+\+|--|[+\-*/%=<>!&|])/ },
    { type: "LBRACE", regex: /^\{/ },
    { type: "RBRACE", regex: /^\}/ },
    { type: "LPAREN", regex: /^\(/ },
    { type: "RPAREN", regex: /^\)/ },
    { type: "SEMICOLON", regex: /^;/ },
    { type: "COMMA", regex: /^,/ },
    { type: "WHITESPACE", regex: /^\s+/ },
  ];

  let tokens = [];
  let cursor = 0;
  while (cursor < code.length) {
    let match = false;
    const substr = code.slice(cursor);
    for (const { type, regex } of tokenPatterns) {
      const m = substr.match(regex);
      if (m) {
        if (type !== "WHITESPACE") {
          tokens.push({ type, value: m[0] });
        }
        cursor += m[0].length;
        match = true;
        break;
      }
    }
    if (!match) cursor++;
  }
  return tokens;
}

function parseToMermaid(tokens) {
  let i = 0;
  let nodeIdCounter = 0;
  const getId = () => `node${nodeIdCounter++}`;
  let chart = "flowchart TD\n";
  // chart += `    start([Start]) --> `;
  chart += "start([Start])\n";


  const clean = (txt) => {
    txt = txt.replace(/["()]/g, "").trim();

    
    txt = txt.replace(/\bprintf\b/g, "Print");
    txt = txt.replace(/\bscanf\b/g, "Input");
    txt = txt.replace(/\bputs\b/g, "Print");
    txt = txt.replace(/\bgets\b/g, "Input");

    if (txt.length > 30) txt = txt.substring(0, 27) + "...";
    return txt;
  };

  function peek(offset = 0) {
    return tokens[i + offset];
  }
  function consume() {
    return tokens[i++];
  }

  while (i < tokens.length) {
    if (peek().value === "main") {
      while (peek() && peek().value !== "{") consume();
      consume();
      break;
    }
    consume();
  }
  if (i >= tokens.length) i = 0;

  function parseUnit(prevId, incomingLabel = "") {
    let labelStr = incomingLabel ? `|${incomingLabel}|` : "";
    let currentId = prevId;
    const t = peek();
    if (!t) return currentId;

    if (t.type === "LBRACE") {
      consume();
      while (i < tokens.length) {
        if (peek().type === "RBRACE") {
          consume();
          break;
        }
        currentId = parseUnit(currentId);
      }
      return currentId;
    }

    if (t.value === "if") {
      consume();
      consume();
      let cond = readCondition();
      const decisionId = getId();
      chart += `    ${currentId} -->${labelStr} ${decisionId}{"${clean(
        cond
      )}?"}\n`;
      const trueUnit = parseUnit(decisionId, "Yes");
      let falseUnit = decisionId;
      if (peek() && peek().value === "else") {
        consume();
        falseUnit = parseUnit(decisionId, "No");
      }
      const mergeId = getId();
      chart += `    ${trueUnit} --> ${mergeId}(( ))\n`;
      if (falseUnit === decisionId)
        chart += `    ${decisionId} -->|No| ${mergeId}\n`;
      else chart += `    ${falseUnit} --> ${mergeId}\n`;
      return mergeId;
    }

    if (t.value === "while") {
      consume();
      consume();
      let cond = readCondition();
      const decisionId = getId();
      chart += `    ${currentId} -->${labelStr} ${decisionId}{"${clean(
        cond
      )}?"}\n`;
      const bodyEnd = parseUnit(decisionId, "Yes");
      chart += `    ${bodyEnd} --> ${decisionId}\n`;
      const exitId = getId();
      chart += `    ${decisionId} -->|No| ${exitId}(( ))\n`;
      return exitId;
    }

    if (t.value === "for") {
      consume();
      consume();
      let init = readUntil("SEMICOLON", true);
      let cond = readUntil("SEMICOLON", true);
      let update = readUntil("RPAREN", true);
      const initId = getId();
      chart += `    ${currentId} -->${labelStr} ${initId}["${clean(init)}"]\n`;
      const decisionId = getId();
      chart += `    ${initId} --> ${decisionId}{"${clean(cond)}?"}\n`;
      const bodyEnd = parseUnit(decisionId, "Yes");
      const updateId = getId();
      chart += `    ${bodyEnd} --> ${updateId}["${clean(update)}"]\n`;
      chart += `    ${updateId} --> ${decisionId}\n`;
      const exitId = getId();
      chart += `    ${decisionId} -->|No| ${exitId}(( ))\n`;
      return exitId;
    }

    if (t.value === "return") {
      consume();
      let val = readUntil("SEMICOLON", true);
      const endId = getId();
      chart += `    ${currentId} -->${labelStr} ${endId}([End])\n`;
      return endId;
    }

    let text = readUntil("SEMICOLON", true);
    if (!text) {
      consume();
      return currentId;
    }
    const nodeId = getId();
    let shape = t.type === "IO" ? ["[/", "/]"] : ["[", "]"];
    chart += `    ${currentId} -->${labelStr} ${nodeId}${shape[0]}"${clean(
      text
    )}"${shape[1]}\n`;
    return nodeId;
  }

  function readCondition() {
    let str = "";
    let p = 1;
    while (p > 0 && i < tokens.length) {
      let v = consume().value;
      if (v == "(") p++;
      if (v == ")") p--;
      if (p > 0) str += v + " ";
    }
    return str;
  }

  function readUntil(type, consumeLast) {
    let str = "";
    while (i < tokens.length) {
      if (peek().type === type) {
        if (consumeLast) consume();
        break;
      }
      if (peek().type === "LBRACE" || peek().type === "RBRACE") break;
      str += consume().value + " ";
    }
    return str;
  }

  let current = "start";
  while (i < tokens.length) {
    if (peek().type === "RBRACE") {
      consume();
      break;
    }
    current = parseUnit(current);
  }
  if (!chart.includes("([End])")) chart += `    ${current} --> stop([End])\n`;
  return chart;
}

function renderFallback(mermaidStr) {
  const container = document.getElementById("flowchart-container");
  container.innerHTML = "";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "1000");
  svg.style.background = "#f8fafc";

  const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
  title.textContent = "Offline Mode (Basic View)";
  title.setAttribute("x", "20");
  title.setAttribute("y", "30");
  title.setAttribute("fill", "red");
  svg.appendChild(title);

  const lines = mermaidStr.split("\n");
  let y = 60;
  const xCenter = 400;

  lines.forEach((line) => {
    line = line.trim();
    if (!line || line.startsWith("flowchart")) return;

    const match = line.match(/"(.*)"/);
    let text = match ? match[1] : line;

    // Clean up text
    text = text.replace(/[-+>|]+/g, " ").trim();
    if (/^[0-9+\-*/\s]+$/.test(text)) return;
    if (text.includes("((")) text = "Connector";
    if (text.includes("([")) text = text.replace(/.*\(\[(.*)\]\).*/, "$1"); // Start/End

    if (!text) return;

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", xCenter - 150);
    rect.setAttribute("y", y);
    rect.setAttribute("width", 300);
    rect.setAttribute("height", 40);
    rect.setAttribute("fill", "#white");
    rect.setAttribute("stroke", "#333");
    rect.setAttribute("rx", 5);
    g.appendChild(rect);

    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t.setAttribute("x", xCenter);
    t.setAttribute("y", y + 25);
    t.setAttribute("text-anchor", "middle");
    t.textContent = text;
    g.appendChild(t);

    // Arrow
    const arrow = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    arrow.setAttribute("x1", xCenter);
    arrow.setAttribute("y1", y - 20);
    arrow.setAttribute("x2", xCenter);
    arrow.setAttribute("y2", y);
    arrow.setAttribute("stroke", "#333");
    if (y > 60) svg.appendChild(arrow);

    svg.appendChild(g);
    y += 60;
  });

  container.appendChild(svg);
}
