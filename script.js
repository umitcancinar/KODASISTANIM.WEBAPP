// --- CSS ENJEKSIYONU (NEON KULLANICI ARAYÜZÜ VE ANİMASYONLAR) ---
// Monaco editörü yüklenmeden önce özel buton ve rozet stillerini dinamik olarak sayfaya ekler.
// Bu yöntem, harici bir CSS dosyasına ihtiyaç duymadan JS içinden stil tanımlamayı sağlar.
const style = document.createElement('style');
style.innerHTML = `
    .neon-btn-primary {
        background: #00ff9d !important; 
        color: #000 !important; 
        border: none !important; 
        padding: 10px 24px !important;
        font-family: 'JetBrains Mono', monospace;
        font-weight: 700 !important; 
        text-transform: uppercase;
        cursor: pointer; 
        border-radius: 4px;
        box-shadow: 0 0 10px rgba(0, 255, 157, 0.4);
        transition: all 0.3s ease;
    }
    .neon-btn-primary:hover { 
        box-shadow: 0 0 20px #00ff9d, 0 0 40px #00ff9d; 
        transform: translateY(-1px);
    }
    .neon-btn-secondary {
        background: transparent !important; 
        color: #fff !important; 
        border: 1px solid rgba(255,255,255,0.3) !important; 
        padding: 10px 20px !important;
        font-family: 'JetBrains Mono', monospace;
        cursor: pointer; 
        border-radius: 4px;
        transition: all 0.3s ease;
        opacity: 0.8;
    }
    .neon-btn-secondary:hover { 
        background: rgba(255,255,255,0.1) !important; 
        border-color: #fff !important;
        opacity: 1;
        box-shadow: 0 0 10px rgba(255,255,255,0.2);
    }
    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding-top: 15px;
        border-top: 1px solid rgba(255,255,255,0.1);
        margin-top: 15px;
    }
    /* Döngü İpucu Rozeti: Kullanıcıya bu alanın bir döngü (liste) girişi olduğunu görsel olarak bildirmek için kullanılır */
    .loop-hint-badge {
        display: inline-block;
        background: rgba(255, 0, 157, 0.15);
        color: #ff009d;
        font-size: 0.75rem;
        padding: 2px 6px;
        border-radius: 4px;
        border: 1px solid rgba(255, 0, 157, 0.3);
        margin-left: 8px;
        vertical-align: middle;
    }
`;
document.head.appendChild(style);

// --- KOD ŞABLONLARI ---
// Her programlama dili için varsayılan başlangıç kodları burada tanımlanır.
// Kullanıcı dil değiştirdiğinde editör bu şablonlardan birini otomatik olarak yükler.
const templates = {
    // PYTHON şablonu: Basit bir main() fonksiyonu ile giriş örneği içerir
    python: `import sys

def main():
    print("Merhaba Dunya! (Python)")
    
    # Ornek girdi alma:
    # isim = input("Adiniz nedir? ")
    # print(f"Merhaba {isim}")

if __name__ == "__main__":
    main()`,

    // JAVA şablonu: Scanner ile standart girdi alan, basit bir Java sınıfı örneği
    java: `import java.util.Scanner;
public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        
        System.out.println("Dunyaya mesajiniz nedir?");
        String mesaj = input.nextLine();
           
        System.out.println("Mesajiniz iletildi: " + mesaj);
        
    }
}`,

    // JAVASCRIPT (NodeJS) şablonu: Temel console.log ve readline modülü hakkında bilgi içerir
    javascript: `console.log("Merhaba Dünya! (NodeJS)");
    
// Not: NodeJS ortaminda calisir.
// Girdi almak icin 'readline' modulu kullanilir.`,

    // C# şablonu: Console.WriteLine ve Console.ReadLine kullanımı gösterilmektedir
    csharp: `using System;

public class Program {
    public static void Main() {
        Console.WriteLine("Merhaba Dünya! (C#)");
        
        // Console.Write("Bir sayi girin: ");
        // string girdi = Console.ReadLine();
        // Console.WriteLine("Girdiniz: " + girdi);
    }
}`,

    // C++ şablonu: iostream kütüphanesi ile temel çıktı örneği
    cpp: `#include <iostream>

int main() {
    std::cout << "Merhaba Dünya! (C++)" << std::endl;
    return 0;
}`,

    // GO şablonu: fmt paketi ile temel ekrana yazdırma örneği
    go: `package main
import "fmt"

func main() {
    fmt.Println("Merhaba Dünya! (Go)")
}`,

    // TYPESCRIPT şablonu: Tip belirtimli temel bir değişken ve çıktı örneği
    typescript: `const message: string = "Merhaba Dünya! (TS)";
console.log(message);`
};

const apiLanguageMap = {
    python: { lang: 'python3', versionIndex: '0' },
    java: { lang: 'java', versionIndex: '0' },
    javascript: { lang: 'nodejs', versionIndex: '0' },
    csharp: { lang: 'csharp', versionIndex: '0' },
    cpp: { lang: 'cpp17', versionIndex: '0' },
    go: { lang: 'go', versionIndex: '0' },
    typescript: { lang: 'typescript', versionIndex: '0' }
};

let editor;
let areSuggestionsEnabled = true;

// Sihirbaz Durum Yönetimi: Girdi toplama sihirbazının hangi aşamada olduğunu,
// hangi verilerin toplandığını ve matris yapısını takip eden nesne.
let wizardState = {
    stage: 0,
    configData: [],
    structure: null,
    finalPayloadParts: { config: "", grid: "" }
};

require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' } });

require(['vs/editor/editor.main'], function () {
    // 1. ADIM: MONACO EDİTÖRÜ OLUŞTUR
    // Monaco Editor, VS Code'un tarayıcıda çalışan versiyonudur.
    // Burada varsayılan dil olarak Java seçilmiş, karanlık tema (vs-dark) uygulanmıştır.
    // automaticLayout: true → editörün pencere boyutu değiştiğinde otomatik yeniden boyutlandırmasını sağlar.
    editor = monaco.editor.create(document.getElementById('editor-container'), {
        value: templates.java, // Sayfa ilk açıldığında Java şablonunu yükle
        language: 'java',
        theme: 'vs-dark',
        automaticLayout: true,   // Pencere boyutu değiştiğinde editörü otomatik ayarla
        minimap: { enabled: true }, // Sağ kenar küçük kod haritasını göster
        fontSize: 14,
        fontFamily: "'JetBrains Mono', monospace",
        scrollBeyondLastLine: false, // Son satırın ötesine kaydırmayı engelle
    });

    // 2. ADIM: DİL SEÇİCİ OLAY DİNLEYİCİSİ
    // Kullanıcı açılır listeden farklı bir dil seçtiğinde changeLanguage() fonksiyonu tetiklenir.
    // Bu sayede editörün sözdizimi renklendirmesi ve şablonu güncellenir.
    const langSelector = document.getElementById('languageSelector');
    if (langSelector) {
        langSelector.addEventListener('change', changeLanguage);
    }

    // 3. ADIM: KLAVYE KISAYOLLARI VE İMLEÇ TAKİBİ
    // Ctrl+Enter (veya Cmd+Enter Mac'te) tuş kombinasyonuna basıldığında kodu çalıştır.
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function () {
        initiateExecution();
    });

    editor.onDidChangeCursorPosition((e) => {
        const satir = e.position.lineNumber;
        const sutun = e.position.column;
        const yaziAlani = document.getElementById('cursorPos') || document.querySelector('.status-bar-right span') || document.querySelector('.footer span');
        if (yaziAlani) {
            yaziAlani.innerText = `Ln ${satir}, Col ${sutun}`;
        }
    });

    document.getElementById('suggestionToggle')?.addEventListener('click', toggleSuggestions);
});

// ============================================================
// --- ANA MANTIK: GELİŞMİŞ KOD AYRIŞTIRICISI (PARSER) ---
// Bu bölüm, kullanıcının yazdığı kodu analiz ederek hangi
// girdilerin gerekli olduğunu otomatik olarak tespit eder.
// ============================================================

function initiateExecution() {
    const code = editor.getValue();
    const needsInput = /Scanner|input\(|cin|ReadLine|fmt\.Scan/.test(code);

    if (!needsInput) {
        executeCode("");
        return;
    }

    const analysis = analyzeCodeStructure(code);

    wizardState = {
        stage: 0,
        configData: analysis.inputs,
        structure: analysis.matrixStructure,
        finalPayloadParts: { config: "", grid: "" }
    };

    openInputWizard();
}

/**
 * PROFESYONEL KOD ANALİZ MOTORU v6.0
 * 
 * Bu fonksiyon, verilen kaynak kodu satır satır tarayarak:
 * - Hangi girdi (input/Scanner/cin/ReadLine) çağrıları yapıldığını,
 * - Bu girdilerden önce hangi mesajların yazdırıldığını (etiket olarak kullanmak için),
 * - Matris / dizi yapıları olup olmadığını,
 * - Döngü içindeki girdi çağrılarını tespit eder.
 * 
 * Tespit edilen tüm girdiler kullanıcıya Girdi Sihirbazı aracılığıyla sorulur.
 * "Ghost Input Fix": Gereksiz nextLine() çağrılarını (satır temizleyici olarak kullanılanlar)
 * yanlışlıkla girdi olarak algılamayı önler.
 */
function analyzeCodeStructure(code) {
    let cleanCode = code
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '');

    const lines = cleanCode.split('\n');
    const inputs = [];
    let matrixStructure = null;
    let matrixVarName = null;

    let scannerVarName = "input";
    const scannerMatch = cleanCode.match(/Scanner\s+(\w+)\s*=\s*new\s+Scanner/);
    if (scannerMatch) scannerVarName = scannerMatch[1];

    const strictInputRegex = new RegExp(
        `(\\b${scannerVarName}\\.(next|nextInt|nextDouble|nextLine|nextBoolean)\\b)` +
        `|(\\bConsole\\.ReadLine\\b)` +
        `|(\\binput\\s*\\()` +
        `|(\\bcin\\s*>>)` +
        `|(\\bfmt\\.Scan)`
    );

    const printRegex = /(?:print|Write|console\.log|fmt\.Print|System\.out\.print)(?:ln|f)?\s*\((.*)\)/;
    let lastPrint = null;

    const matrixDeclRegex = /(?:int|double|String)\s*\[\s*\]\s*\[\s*\]\s*(\w+)\s*=\s*new\s+\w+\s*\[\s*(\d+)\s*\](?:\s*\[\s*(\d+)\s*\])?/;
    const matrixMatch = code.match(matrixDeclRegex);

    if (matrixMatch) {
        matrixVarName = matrixMatch[1];
        matrixStructure = {
            type: matrixMatch[3] ? "2D" : "1D",
            rowRef: matrixMatch[2],
            colRef: matrixMatch[3],
            rows: parseInt(matrixMatch[2]),
            cols: matrixMatch[3] ? parseInt(matrixMatch[3]) : 0
        };
    } else {
        const arrayRegex = /new\s+\w+\s*\[\s*(\d+)\s*\](?:\s*\[\s*(\d+)\s*\])?/;
        const arrayMatch = code.match(arrayRegex);
        if (arrayMatch) {
            matrixStructure = {
                type: arrayMatch[2] ? "2D" : "1D",
                rowRef: arrayMatch[1],
                colRef: arrayMatch[2],
                rows: parseInt(arrayMatch[1]),
                cols: arrayMatch[2] ? parseInt(arrayMatch[2]) : 0
            };
        }
    }

    let currentBraceLevel = 0;
    let loopStack = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;
        const isLoopStart = /^(?:for|while|do)\b/.test(line);

        if (isLoopStart) {
            loopStack.push(currentBraceLevel + 1);
        }

        const pMatch = line.match(printRegex);
        if (pMatch) {
            let rawContent = pMatch[1];
            const quoteMatch = rawContent.match(/"([^"]+)"/);

            if (quoteMatch && quoteMatch[1].length > 1) {
                lastPrint = quoteMatch[1].replace(/[:=]/g, '').trim();
            } else {
                let content = rawContent.replace(/["';+]/g, '').trim();
                content = content.replace(/\(.*?\)/g, '');
                if (content.length > 0) lastPrint = content.trim();
            }
        }

        if (strictInputRegex.test(line)) {
            const isNextLine = line.includes("nextLine");
            const hasAssignment = line.includes("=");
            if (isNextLine && !hasAssignment && !line.includes("print")) {
                lastPrint = null;
                continue;
            }

            const assignMatch = line.match(/(?:int|String|double|float|var|char|boolean)?\s*(\w+|(?:\w+\[.*?\]))\s*=/);
            let varName = assignMatch ? assignMatch[1] : null;
            if (varName && varName.includes("[")) varName = varName.split("[")[0];

            if (matrixStructure && matrixStructure.rows > 0) {
                if (varName && varName === matrixVarName) {
                    lastPrint = null;
                    continue;
                }
                if (!varName && loopStack.length > 0 && currentBraceLevel >= loopStack[loopStack.length - 1]) {
                    lastPrint = null;
                    continue;
                }
            }

            let label = lastPrint;
            if (!label || label.length < 2) {
                label = varName ? (varName + " Değeri") : "Girdi";
            }

            const isInLoop = loopStack.length > 0 && currentBraceLevel + openBraces >= loopStack[loopStack.length - 1];

            inputs.push({
                id: inputs.length,
                label: label,
                isDimension: false,
                isLoopInput: isInLoop,
                ref: varName,
                value: ""
            });

            lastPrint = null;
        }

        currentBraceLevel += (openBraces - closeBraces);

        if (loopStack.length > 0 && currentBraceLevel < loopStack[loopStack.length - 1]) {
            loopStack.pop();
        }
    }

    return { inputs, matrixStructure };
}

// ============================================================
// --- GİRDİ SİHİRBAZI KULLANICI ARAYÜZÜ MANTIĞI ---
// Bu bölüm, analiz edilen girdileri toplayacak modal penceresini
// dinamik olarak oluşturur ve yönetir. İki aşamadan oluşur:
// Aşama 1: Sıradan değişken girdileri
// Aşama 2: Matris / tablo girdileri (varsa)
// ============================================================

function openInputWizard() {
    setupModal("GİRDİ SİHİRBAZI", "Program çalıştırılmadan önce veriler toplanıyor.");

    const toggleContainer = document.querySelector('.input-mode-toggle');
    if (toggleContainer) toggleContainer.style.display = 'none';

    renderStage1();
    showModal();
}

function renderFooterButtons(primaryText, primaryAction, showBack = false) {
    let footer = document.querySelector('.modal-footer');
    if (!footer) {
        const modalContent = document.querySelector('.modal-content') || document.getElementById('inputModal');
        footer = document.createElement('div');
        footer.className = 'modal-footer';
        modalContent.appendChild(footer);
    }
    footer.innerHTML = '';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'neon-btn-secondary';
    cancelBtn.innerText = 'İPTAL';
    cancelBtn.onclick = closeModal;

    if (showBack) {
        const backBtn = document.createElement('button');
        backBtn.className = 'neon-btn-secondary';
        backBtn.innerText = '← GERİ';
        backBtn.onclick = () => { renderStage1(); };
        footer.appendChild(backBtn);
    }

    const actionBtn = document.createElement('button');
    actionBtn.className = 'neon-btn-primary';
    actionBtn.id = 'wizardActionBtn';
    actionBtn.innerText = primaryText;
    actionBtn.onclick = primaryAction;

    footer.appendChild(cancelBtn);
    footer.appendChild(actionBtn);
}

function renderStage1() {
    wizardState.stage = 0;
    const container = document.getElementById('dynamicInputs');
    container.innerHTML = '';

    const hasInputs = wizardState.configData.length > 0;
    const hasFixedMatrix = wizardState.structure && wizardState.structure.rows > 0;

    if (!hasInputs && hasFixedMatrix) {
        const info = document.createElement('div');
        info.className = 'wizard-step-info';
        info.innerHTML = `<strong>Aşama 1/2:</strong> Hazırlık`;
        container.appendChild(info);

        const msg = document.createElement('div');
        msg.style.cssText = "padding: 20px; text-align: center; color: #aaa;";
        msg.innerHTML = "📝 Bu bölümde girilecek veri yok.<br>Matris tablosunu oluşturmak için devam ediniz.";
        container.appendChild(msg);

        renderFooterButtons("DEVAM ET (TABLO OLUŞTUR)", () => { renderStage2(); }, false);
        return;
    }

    const info = document.createElement('div');
    info.className = 'wizard-step-info';
    info.innerHTML = `<strong>Aşama 1/2:</strong> Değişken Tanımları & Veri Girişi`;
    container.appendChild(info);

    if (hasInputs) {
        wizardState.configData.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'input-group';

            const defaultValue = item.value || '';
            let placeholderText = "Cevabınızı buraya yazın...";
            let loopHint = "";

            if (item.isDimension) {
                placeholderText = "Örn: 3 (Tablo Boyutu)";
            } else if (item.isLoopInput) {
                placeholderText = "DÖNGÜ: Değerleri birer boşluk ara ile girin (Örn: Ali Veli Ayşe)";
                loopHint = `<span class="loop-hint-badge">DÖNGÜ (Liste)</span>`;
            }

            div.innerHTML = `
                <label class="input-label">
                    ${index + 1}. ${item.label} 
                    ${item.isDimension ? '<span style="color:#00ff9d; font-weight:bold; margin-left:5px;">(Tablo Boyutu)</span>' : ''}
                    ${loopHint}
                </label>
                <input type="text" class="modal-input stage1-input" 
                       data-index="${index}" 
                       data-ref="${item.ref || ''}"
                       data-is-loop="${item.isLoopInput}"
                       value="${defaultValue}" 
                       placeholder="${placeholderText}">
            `;
            container.appendChild(div);
        });

        setTimeout(() => {
            const inputs = container.querySelectorAll('.stage1-input');
            inputs.forEach((input, idx) => {
                input.onkeydown = (e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        if (idx < inputs.length - 1) {
                            inputs[idx + 1].focus();
                        } else {
                            handleStage1Submit();
                        }
                    }
                };
            });
            if (inputs.length > 0) inputs[0].focus();
        }, 100);
    }

    const btnText = hasFixedMatrix ? "DEVAM ET (TABLO OLUŞTUR)" : "GÖNDER VE ÇALIŞTIR";
    renderFooterButtons(btnText, handleStage1Submit, false);
}

function handleStage1Submit() {
    const inputs = document.querySelectorAll('.stage1-input');
    let configPayload = "";

    let loopBuffer = [];

    const flushLoopBuffer = () => {
        if (loopBuffer.length === 0) return "";
        let result = "";
        const maxLen = Math.max(...loopBuffer.map(arr => arr.length));
        for (let i = 0; i < maxLen; i++) {
            loopBuffer.forEach(arr => {
                if (i < arr.length) {
                    result += arr[i] + "\n";
                }
            });
        }
        loopBuffer = [];
        return result;
    };

    if (inputs.length > 0) {
        inputs.forEach(inp => {
            const val = inp.value.trim();
            const idx = parseInt(inp.dataset.index);
            const isLoop = inp.dataset.isLoop === "true";

            if (wizardState.configData[idx]) {
                wizardState.configData[idx].value = val;
            }

            if (isLoop) {
                const items = val.split(/\s+/).filter(x => x.length > 0);
                loopBuffer.push(items);
            } else {
                configPayload += flushLoopBuffer();
                configPayload += val + "\n";
            }
        });
        configPayload += flushLoopBuffer();
    }

    wizardState.finalPayloadParts.config = configPayload;

    if (wizardState.structure && wizardState.structure.rows > 0) {
        renderStage2();
    } else {
        submitFinalInput();
    }
}

function renderStage2() {
    wizardState.stage = 1;
    const container = document.getElementById('dynamicInputs');
    container.innerHTML = '';

    const s = wizardState.structure;
    const info = document.createElement('div');
    info.className = 'wizard-step-info';
    info.innerHTML = `<strong>Aşama 2/2:</strong> Matris Verileri (${s.type}: ${s.layers || 1}x${s.rows}x${s.cols})`;
    container.appendChild(info);

    generateGridUI(container, s.layers || 1, s.rows, s.cols, s.type);
    renderFooterButtons("ÇALIŞTIR", submitFinalInput, true);
}

function generateGridUI(container, layers, rows, cols, type) {
    const tableContainer = document.createElement('div');
    tableContainer.style.cssText = "max-height: 400px; overflow-y: auto; margin-top:10px;";
    const tableStyle = "width: 100%; border-collapse: separate; border-spacing: 4px; background: rgba(0,0,0,0.2); border-radius: 8px;";

    for (let l = 0; l < layers; l++) {
        if (type === "3D") {
            const h4 = document.createElement('h4');
            h4.innerText = `KATMAN ${l}`;
            tableContainer.appendChild(h4);
        }

        const table = document.createElement('table');
        table.style.cssText = tableStyle;

        for (let r = 0; r < rows; r++) {
            const tr = document.createElement('tr');
            for (let c = 0; c < cols; c++) {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'number';
                input.className = 'modal-input wizard-cell';
                input.value = "0";
                input.style.cssText = "text-align: center; min-width: 50px; border: 1px solid rgba(255,255,255,0.1);";
                input.onfocus = function () { this.select(); };
                input.onkeydown = (e) => handleGridNavigation(e, input);

                td.appendChild(input);
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }
        tableContainer.appendChild(table);
    }
    container.appendChild(tableContainer);
}

function handleGridNavigation(e, currentInput) {
    if (e.key === "Enter") {
        e.preventDefault();
        const allInputs = [...document.querySelectorAll('.wizard-cell')];
        const index = allInputs.indexOf(currentInput);
        if (index < allInputs.length - 1) allInputs[index + 1].focus();
        else submitFinalInput();
    }
}

window.submitFinalInput = function () {
    if (wizardState.stage === 1) {
        const inputs = document.querySelectorAll('.wizard-cell');
        const values = Array.from(inputs).map(inp => inp.value || "0");
        wizardState.finalPayloadParts.grid = values.join(" ");
    }

    let finalPayload = wizardState.finalPayloadParts.config.trim();
    if (wizardState.finalPayloadParts.grid) {
        finalPayload = finalPayload ? (finalPayload + "\n" + wizardState.finalPayloadParts.grid) : wizardState.finalPayloadParts.grid;
    }

    closeModal();
    executeCode(finalPayload);
}

function setupModal(title, desc) {
    document.querySelector('.title-text span:first-child').innerText = title;
    document.getElementById('modalDesc').innerText = desc;
    document.getElementById('dynamicInputs').innerHTML = '';
}

function showModal() {
    document.getElementById('inputModal').classList.add('active');
}

window.closeModal = function () {
    document.getElementById('inputModal').classList.remove('active');
}

async function executeCode(stdinData) {
    const btn = document.getElementById('runBtn');
    const outputDiv = document.getElementById('outputContent');
    const statusMsg = document.getElementById('statusMsg');
    const loadingDot = document.getElementById('loadingIndicator');
    const lang = document.getElementById('languageSelector').value;

    if (btn) btn.disabled = true;
    loadingDot.style.display = 'flex';
    statusMsg.innerText = "DERLENİYOR...";
    outputDiv.innerHTML = '';

    const config = apiLanguageMap[lang] || { lang: 'nodejs', versionIndex: '0' };
    const payload = {
        clientId: "e42a336c3b33aaf020f8f47158dafd4",
        clientSecret: "6e54e78b2561fd28e1b2a7eb994b877a5b4597107b5d35977a5b75e1c01c4015",
        script: editor.getValue(),
        language: config.lang,
        versionIndex: config.versionIndex,
        stdin: stdinData || ""
    };

    try {
        // ÇALIŞMA ORTAMI TESPİTİ:
        // Uygulama yerel dosya olarak açılıyorsa (file://, localhost veya 127.0.0.1),
        // JDoodle API'sine doğrudan istek gönderilir.
        // Netlify gibi bir sunucuya deploy edilmişse, CORS hatalarını önlemek için
        // kendi sunucumuz üzerindeki proxy endpoint'i (/api/v1/execute) kullanılır.
        const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.protocol === "file:";
        const endpoint = isLocal ? "https://api.jdoodle.com/v1/execute" : "/api/v1/execute";

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.statusCode === 200) {
            // BAŞARILI ÇALIŞMA: Programın çıktısını terminale yazdır ve
            // bellek kullanımı ile CPU süresini alt bilgi olarak göster.
            const out = data.output || "Çıktı Yok";
            outputDiv.innerHTML += `<div class="log-success" style="white-space: pre; overflow-x: auto; font-family: 'JetBrains Mono', monospace;">${out}</div>`;
            outputDiv.innerHTML += `<div class="log-exit-success">\nBellek: ${data.memory || 0} KB | CPU Süresi: ${data.cpuTime || 0}s</div>`;
            statusMsg.innerText = "BAŞARILI";
        } else {
            // HATA DURUMU: JDoodle API'sinden dönen hata mesajını terminalde kırmızı renkte göster.
            // Derleme hatası, sözdizim hatası veya geçersiz istek gibi durumlar buraya düşer.
            const err = data.error || data.output || "Bilinmeyen Hata veya Hatalı İstek";
            outputDiv.innerHTML += `<div class="log-error" style="white-space: pre;">${err}</div>`;
            statusMsg.innerText = "HATA";
        }
    } catch (e) {
        outputDiv.innerHTML = `<div class="log-error">API Hatası: ${e.message}</div>`;
        statusMsg.innerText = "BAĞLANTI YOK";
    } finally {
        if (btn) btn.disabled = false;
        loadingDot.style.display = 'none';
        outputDiv.scrollTop = outputDiv.scrollHeight;
    }
}

function toggleSuggestions() {
    areSuggestionsEnabled = !areSuggestionsEnabled;
    editor.updateOptions({ quickSuggestions: areSuggestionsEnabled });
    document.getElementById('suggestionIcon').innerText = areSuggestionsEnabled ? '💡' : '⚫';
    showToast(areSuggestionsEnabled ? "Öneriler Açıldı" : "Öneriler Kapatıldı");
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    monaco.editor.setTheme(isLight ? 'vs' : 'vs-dark');
    document.getElementById('themeIcon').innerText = isLight ? '☀️' : '🌙';
}

function changeLanguage() {
    const lang = document.getElementById('languageSelector').value;
    monaco.editor.setModelLanguage(editor.getModel(), lang);
    if (templates[lang]) {
        editor.setValue(templates[lang]);
    }
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

(function () {
    const c = document.getElementById('binaryBg');
    if (!c) return;
    const ctx = c.getContext('2d');
    let w = c.width = window.innerWidth;
    let h = c.height = window.innerHeight;
    const cols = Math.floor(w / 20);
    const ypos = Array(cols).fill(0);
    window.addEventListener('resize', () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; });
    setInterval(() => {
        ctx.fillStyle = '#0001'; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#0f0'; ctx.font = '15pt monospace';
        ypos.forEach((y, i) => {
            ctx.fillText(String.fromCharCode(Math.random() * 128), i * 20, y);
            ypos[i] = (y > 100 + Math.random() * 10000) ? 0 : y + 20;
        });
    }, 50);
})();

// ============================================================
// --- YAPAY ZEKA ASİSTAN MANTIĞI (GROQ API - Llama 3.3 70B) ---
// Bu bölüm, sağ alttaki AI sohbet panelini yönetir.
// Groq platformu üzerinde çalışan Meta'nın Llama 3.3 70B modeli kullanılır.
// Editördeki mevcut kod her mesajda bağlam olarak AI'ya gönderilir,
// böylece AI gerçek zamanlı olarak kodu anlayıp yorum yapabilir.
// ============================================================

// Varsayılan API Anahtarı GİZLENDİ: Güvenlik sebebiyle artık front-end kodlarında anahtar bulunmuyor.
// İstekler Netlify Serverless Functions (Backend) üzerinden yapılacak.
let isUsingCustomKey = false;
let customApiKey = "";

// Kullanıcı yine de kendi anahtarını girmek isterse diye yerel depolama desteği
const savedKey = localStorage.getItem('custom_groq_api_key');
if (savedKey) {
    customApiKey = savedKey;
    isUsingCustomKey = true;
}

// SOHBET HAFIZASI (Gerçek zamanlı sohbet deneyimi için)
// Asistanın önceki konuşmaları hatırlaması için son N mesajı tutacağımız dizi.
let conversationHistory = [];

function toggleAIWidget() {
    const container = document.getElementById('ai-widget-container');
    container.classList.toggle('open');
    if (container.classList.contains('open')) {
        // UI'da kayıtlı anahtar varsa göster
        document.getElementById('geminiApiKey').value = customApiKey;
        document.getElementById('aiChatInput').focus();
    }
}

function saveApiKey() {
    const key = document.getElementById('geminiApiKey').value.trim();
    if (key) {
        customApiKey = key;
        isUsingCustomKey = true;
        localStorage.setItem('custom_groq_api_key', key);
        showToast("Özel API Anahtarı Kaydedildi! (İstekler direkt gidecek)");
    } else {
        customApiKey = '';
        isUsingCustomKey = false;
        localStorage.removeItem('custom_groq_api_key');
        showToast("Özel Anahtar Silindi. Sistem (Sunucu) Anahtarı Kullanılacak.");
    }
}

async function sendAIMessage() {
    const inputEl = document.getElementById('aiChatInput');
    const msg = inputEl.value.trim();

    if (!msg) return;

    // Kullanıcının yazdığı mesajı sohbet penceresine kullanıcı balonu olarak ekle
    appendChatMsg(msg, 'ai-user');
    inputEl.value = ''; // Mesaj gönderildikten sonra metin kutusunu temizle

    // AI yanıt üretirken gösterilecek animasyonlu "Düşünüyor..." yükleme göstergesini ekle
    const thinkingId = 'thinking-' + Date.now();
    appendChatMsg('<span class="ai-thinking">Kodunuz inceleniyor... <div class="cyber-loader" style="width:14px; height:14px; margin-left:8px;"></div></span>', 'ai-bot', thinkingId);

    const editorCode = editor ? editor.getValue() : "Mevcut kod bulunamadı.";

    // SİSTEM KOMUTU (GELİŞMİŞ EĞİTMEN PERSONASI)
    // Asistana doğrudan kod vermek yerine adım adım rehberlik etmesini,
    // hataları açıklamasını ve yönlendirici olmasını söylüyoruz.
    const systemPrompt = `Sen 'KODASİSTANİM' IDE'sinde çalışan, uzman, samimi ve yönlendirici bir yapay zeka programlama asistanısın. 
Geliştiricinin kodunu inceleyip sorunları bulmak ve ona kodlamayı ÖĞRETMEK ilk amacındır.

KURALLAR:
1. Geliştirici hata sorarsa, nerede hata yaptığını açıkla ancak hemen tüm kodu düzeltip verme. Önce hatanın mantığını anlat ve ne yapması gerektiğine dair ipucu ver.
2. Açıklamalarından sonra "Size doğru kodu adım adım göstereyim mi?" veya "Denemek ister misiniz, yoksa düzeltilmiş halini vereyim mi?" diye sor.
3. Eğer kullanıcı kodu isterse ya da "Kodu ver", "Doğrusunu yaz" gibi direktif verirse o zaman KODUN TAMAMINI düzeltilmiş halde Markdown kod bloğu (\`\`\`) ile ver. 
4. Kod verirken Markdown kısmında mutlaka dili (örn \`\`\`javascript) belirt.
5. Sohbeti kısa, samimi ve Türkçe tut. Geliştirici ile gerçek zamanlı yazışıyormuş gibi davran.`;

    // Geçmişe kullanıcının mesajını ekle
    conversationHistory.push({ role: "user", content: msg });

    // Geçmişteki mesajların sayısını sınırla (Son 10 mesajı - 5 soru 5 cevap - tutsun)
    if (conversationHistory.length > 10) {
        conversationHistory = conversationHistory.slice(conversationHistory.length - 10);
    }

    try {
        let payload;
        let endpoint;
        let headers = { 'Content-Type': 'application/json' };

        // API'ye gidecek nihai mesaj listesini hazırla
        // (Sistem komutu + Kodu bağlam olarak veren ek bilgi + Konuşma geçmişi)
        const apiMessages = [
            { role: "system", content: systemPrompt },
            { role: "system", content: "Geliştiricinin mevcut kodu şudur:\n```\n" + editorCode + "\n```" },
            ...conversationHistory
        ];

        if (isUsingCustomKey && customApiKey) {
            // KULLANICI KENDİ ANAHTARINI GİRMİŞSE: Direkt Groq'a git
            endpoint = "https://api.groq.com/openai/v1/chat/completions";
            headers['Authorization'] = 'Bearer ' + customApiKey;
            payload = {
                model: "llama-3.3-70b-versatile",
                messages: apiMessages,
                temperature: 0.7,
                max_tokens: 2048,
            };
        } else {
            // VARSAYILAN (GÜVENLİ) ÇALIŞMA MODU: İstek arka plan (Backend) servisimize gider
            endpoint = "/api/chat";
            payload = {
                messages: apiMessages,
                codeSnippet: editorCode
            };
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        removeChatMsg(thinkingId);

        if (!response.ok || data.error) {
            let errorMsg = data.error?.message || "Bilinmeyen Sunucu Hatası";
            appendChatMsg(`API Bağlantı Hatası: <br><span style="color:#ff4444">${errorMsg}</span><br>Lütfen API anahtarınızı kontrol edin.`, 'ai-bot');
            // Hata aldıysa son gönderdiğimiz mesajı geçmişten çıkar ki takılı kalmasın
            conversationHistory.pop();
        } else if (data.choices && data.choices.length > 0) {
            let aiText = data.choices[0].message.content;

            // Asistanın yanıtını yapay zeka geçmişine (hafızaya) kaydet
            conversationHistory.push({ role: "assistant", content: aiText });

            aiText = parseAIMarkdown(aiText);
            appendChatMsg(aiText, 'ai-bot');
        } else {
            appendChatMsg("Güvenlik veya başka bir sebepten dolayı AI boş cevap döndürdū.", 'ai-bot');
            conversationHistory.pop();
        }

    } catch (err) {
        removeChatMsg(thinkingId);
        appendChatMsg(`Ağ Hatası bağlantı kurulamadı: ${err.message}`, 'ai-bot');
    }
}

function parseAIMarkdown(text) {
    // GÜVENLİK: XSS (Siteler Arası Betik Çalıştırma) saldırılarını önlemek için HTML'i temizle
    let safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Benzersiz ID oluşturucu (Kopyalama ve Uygulama hedefleri için)
    let blockCounter = 0;

    // KOD BLOKLARI ve BUTON EKLENTİLERİ:
    // Üç backtick (```) ile çevrelenen kod bloklarını yakala.
    // Her bloğun üstüne "Kopyala" ve "Koda Uygula" butonlarını içeren bir Header bar ekle
    safeText = safeText.replace(/```([a-zA-Z0-9+#\-]*)\n([\s\S]*?)```/g, function (match, lang, code) {
        blockCounter++;
        const blockId = 'ai-code-block-' + Date.now() + '-' + blockCounter;
        const langLabel = lang ? lang.toUpperCase() : 'CODE';

        // Kodu encode ediyoruz ki HTML butonunun onClick'ine güvenle yazabilelim
        const encodedCode = encodeURIComponent(code);

        return `
            <div class="ai-code-wrapper">
                <div class="ai-code-header">
                    <span class="ai-code-lang">${langLabel}</span>
                    <div class="ai-code-actions">
                        <button class="ai-code-btn" onclick="copyAiCode('${encodedCode}', this)">📋 Kopyala</button>
                        <button class="ai-code-btn highlight-btn" onclick="applyAiCode('${encodedCode}', this)">🚀 Koda Uygula</button>
                    </div>
                </div>
                <pre><code id="${blockId}">${code}</code></pre>
            </div>
        `;
    });

    // SATIR İÇİ KOD: Tek backtick ile çevrelenen kısa kodu <code> etiketiyle sar
    safeText = safeText.replace(/`([^`]+)`/g, '<code>$1</code>');

    // KALIN YAZI: **metin** formatını <strong> etiketiyle kalın metne dönüştür
    safeText = safeText.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');

    // SATIR SONU DÖNÜŞÜMü: \n kaçış dizilerini <br> etiketine çevir.
    // Önemli: <pre> blokları içinde <br> eklememek gerekir, aksi hâlde kod blokları bozulur.
    // Regex negatif önden bakış (lookahead) kullanmak çok karmaşık olacağından,
    // metin önce <pre> bloklarına göre parçalara ayrılır, her parçanın pre dışındaki
    // kısmına dönüşüm uygulanır, sonra parçalar tekrar birleştirilir.
    const blocks = safeText.split('<pre>');
    for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].includes('</pre>')) {
            const parts = blocks[i].split('</pre>');
            parts[1] = parts[1].replace(/\\n/g, '<br>');
            blocks[i] = parts[0] + '</pre>' + parts[1];
        } else {
            blocks[i] = blocks[i].replace(/\\n/g, '<br>');
        }
    }
    safeText = blocks.join('<pre>');

    return safeText;
}

function appendChatMsg(htmlContent, typeClass, id = '') {
    const body = document.getElementById('aiChatBody');
    const msgDiv = document.createElement('div');
    msgDiv.className = `ai-message ${typeClass}`;
    if (id) msgDiv.id = id;
    msgDiv.innerHTML = `<div class="msg-content">${htmlContent}</div>`;
    body.appendChild(msgDiv);

    setTimeout(() => {
        body.scrollTop = body.scrollHeight;
    }, 50);
}

function removeChatMsg(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// BROWSER GLOBALS: Kopyala ve Koda Uygula butonlarının onclick olayları için fonksiyonlar
window.copyAiCode = function (encodedCode, btnElement) {
    const code = decodeURIComponent(encodedCode);
    navigator.clipboard.writeText(code).then(() => {
        const originalText = btnElement.innerHTML;
        btnElement.innerHTML = "✅ Kopyalandı!";
        btnElement.style.color = "#00ff9d";
        setTimeout(() => {
            btnElement.innerHTML = originalText;
            btnElement.style.color = "";
        }, 2000);
    }).catch(err => {
        showToast("Kopyalama başarısız oldu.");
        console.error("Panoya kopyalanamadı:", err);
    });
};

window.applyAiCode = function (encodedCode, btnElement) {
    const code = decodeURIComponent(encodedCode);

    // Editör açık ve kurulu mu kontrol et
    if (editor) {
        // Mevcut kodun tamamını yeni kodla değiştir
        // Geliştirilmiş bir versiyonda seçili alanı (selection) değiştirme de yapılabilir
        editor.setValue(code);

        const originalText = btnElement.innerHTML;
        btnElement.innerHTML = "✨ Uygulandı!";
        btnElement.style.color = "#00ff9d";

        showToast("AI kodu başarıyla editöre aktarıldı!");

        setTimeout(() => {
            btnElement.innerHTML = originalText;
            btnElement.style.color = "";
        }, 2000);
    } else {
        showToast("Editör hazır değil!");
    }
};

// GLOBAL OLAY DİNLEYİCİLERİ
// Sayfa tamamen yüklendikten sonra (DOMContentLoaded) çalışır.
// Enter tuşuna basıldığında (Shift+Enter hariç) AI mesajı otomatik olarak gönderilir.
// Shift+Enter ise metin kutusunda yeni satır açmayı sağlar.
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('aiChatInput');
    if (chatInput) {
        chatInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendAIMessage();
            }
        });
    }
});