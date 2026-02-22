// ============================================================
// Columbia Bank — Loan Officer Sales Planner
// Gemini API Integration (API key stored in localStorage)
// ============================================================

const STORAGE_KEY = 'gemini_api_key';

// ---- API Key Management ----
function getApiKey() {
    return localStorage.getItem(STORAGE_KEY) || '';
}

function saveApiKey(key) {
    localStorage.setItem(STORAGE_KEY, key.trim());
}

function clearApiKey() {
    localStorage.removeItem(STORAGE_KEY);
}

function getApiUrl(apiKey) {
    return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
}

// ---- DOM Elements ----
const salesForm = document.getElementById('salesForm');
const cityInput = document.getElementById('cityInput');
const stateSelect = document.getElementById('stateSelect');
const generateBtn = document.getElementById('generateBtn');
const btnText = generateBtn.querySelector('.btn-text');
const btnLoading = generateBtn.querySelector('.btn-loading');
const resultsSection = document.getElementById('resultsSection');
const resultsTitle = document.getElementById('resultsTitle');
const resultsContent = document.getElementById('resultsContent');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');
const printBtn = document.getElementById('printBtn');
const copyBtn = document.getElementById('copyBtn');

// Modal elements
const apiKeyModal = document.getElementById('apiKeyModal');
const apiKeyForm = document.getElementById('apiKeyForm');
const apiKeyInput = document.getElementById('apiKeyInput');
const changeKeyBtn = document.getElementById('changeKeyBtn');

// ---- Modal Logic ----
function showModal() {
    apiKeyInput.value = '';
    apiKeyModal.style.display = 'flex';
    setTimeout(() => apiKeyInput.focus(), 100);
}

function hideModal() {
    apiKeyModal.style.display = 'none';
}

function updateKeyButtonVisibility() {
    changeKeyBtn.style.display = getApiKey() ? 'inline-flex' : 'none';
}

// On page load: show modal if no key saved
document.addEventListener('DOMContentLoaded', () => {
    if (!getApiKey()) {
        showModal();
    }
    updateKeyButtonVisibility();
});

// Save key from modal form
apiKeyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const key = apiKeyInput.value.trim();
    if (!key) return;
    saveApiKey(key);
    hideModal();
    updateKeyButtonVisibility();
});

// Change key button in header
changeKeyBtn.addEventListener('click', () => {
    showModal();
});

// ---- Build the Prompt ----
function buildPrompt(city, state) {
    return `You are an expert home loan sales strategist and real estate market analyst. A home loan officer at Columbia Bank wants to grow their business in **${city}, ${state}**. Generate a comprehensive, actionable **3-month sales plan** broken into the sections below. Use real-world knowledge of this area. Be specific — use actual neighborhood names, demographic patterns, and local institutions when possible.

Format the entire response in clean Markdown with headers, bullet points, numbered lists, and tables where appropriate.

---

## SECTION 1: Demographic Profile of ${city}, ${state}

Provide a detailed demographic overview, presented in a table and narrative format. Include:
- **Population** (estimated)
- **Median Age**
- **Median Household Income**
- **Racial / Ethnic Makeup** (percentages)
- **Homeownership Rate** vs. renter rate
- **Median Home Price**
- **Average Household Size**
- **Education Levels** (% with bachelor's or higher)
- **Top Industries / Employers** in the area
- **Population Growth Trend** (growing, stable, declining)
- Any other interesting or noteworthy demographic data relevant to mortgage lending

---

## SECTION 2: Market Analysis & Recommended Loan Strategy

Analyze the current real estate market conditions in ${city}, ${state}:
- Estimated **number of active home listings**
- Estimated **average days on market**
- **Home sales volume** trends (up, down, or stable)
- **Interest rate environment** impact on this market
- Whether the market currently favors **purchase activity, refinancing activity, or both**, and why

Based on this analysis, recommend which loan products the officer should prioritize:
- **Purchase loans** (conventional, government FHA/VA/USDA, jumbo)
- **Rate/Term Refinance**
- **Cash-Out Refinance**
- **Renovation loans** (FHA 203k, HomeStyle, etc.)
- **New Construction loans**

Explain the reasoning for each recommendation tied to the demographics and market data.

---

## SECTION 3: 3-Month Sales Plan

Create a **month-by-month action plan** (Month 1, Month 2, Month 3) with specific, actionable sales activities. Include a mix of:

### Tried-and-True Activities:
- Realtor relationship building (lunch & learns, co-marketing)
- Open house partnerships
- Past client outreach / referral campaigns
- Builder & developer networking
- Financial planner / CPA partnerships
- Community event sponsorships

### Creative / Unique Activities:
- First-time homebuyer workshops (in-person and virtual)
- Social media campaigns targeting specific demographics
- Partnerships with local non-profits (homeownership education)
- Neighborhood-specific direct mail or door-knocking campaigns
- "Homeownership myth-busting" content series
- Bilingual outreach if demographics support it
- Niche marketing (veterans, self-employed, gig workers, etc.)

For each month, provide:
- **Focus theme** for the month
- **5–8 specific action items** with brief descriptions
- **Target metrics / goals** (e.g., number of new realtor contacts, applications, pre-approvals)

---

## SECTION 4: Closest Columbia Bank Branches

List the **3 closest Columbia Bank branch locations** to ${city}, ${state}. For each, provide:
- Branch name
- Full address
- Approximate distance from the city center
- Phone number (if known)

If you are not certain of exact branch locations, provide your best estimate of the closest branches based on known Columbia Bank locations in the Pacific Northwest and surrounding states.

---

## SECTION 5: Top Realtors to Connect With

List the **top 8 real estate agents / realtors** in or near ${city}, ${state} that the loan officer should prioritize building relationships with. Focus on high-producing agents who are active in the local market. For each, provide:
- **Name**
- **Brokerage / Company**
- **Phone number** (if known)
- **Email address** (if known)
- **Website or profile URL** (if known)
- **Why they're a good contact** (e.g., top producer, specializes in first-time buyers, active in new construction, etc.)

Present this as a table for easy reference.

---

## SECTION 6: Local Homeownership Resources & Non-Profits

List **3 to 5 non-profit organizations or community organizations** near ${city}, ${state} that support homeownership, housing assistance, or financial literacy. For each, provide:
- Organization name
- Brief description of what they do
- Website (if known)
- How the loan officer could partner with them

---

## SECTION 7: Executive Summary & Quick-Start Checklist

End with:
1. A brief **executive summary** (3–4 sentences) of the overall strategy
2. A **"Week 1 Quick-Start Checklist"** of 5–7 things the loan officer should do immediately

---

Make the plan practical, motivating, and ready to execute. Use specific numbers and targets where possible. Think like a top-producing loan officer.`;
}

// ---- Call Gemini API ----
async function callGemini(city, state) {
    const apiKey = getApiKey();
    if (!apiKey) {
        showModal();
        throw new Error('Please enter your Gemini API key to continue.');
    }

    const prompt = buildPrompt(city, state);

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: prompt }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.85,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 12000
        }
    };

    const response = await fetch(getApiUrl(apiKey), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData?.error?.message || `API returned status ${response.status}`;

        // If the key is invalid, clear it and show the modal
        if (response.status === 400 || response.status === 401 || response.status === 403) {
            clearApiKey();
            updateKeyButtonVisibility();
            showModal();
            throw new Error('Invalid API key. Please enter a valid Gemini API key.');
        }

        throw new Error(msg);
    }

    const data = await response.json();

    // Extract text from response
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
        throw new Error('No content received from Gemini. Please try again.');
    }

    return text;
}

// ---- Simple Markdown → HTML Renderer ----
function renderMarkdown(md) {
    let html = md;

    // Horizontal rules
    html = html.replace(/^---+$/gm, '<hr>');

    // Tables
    html = html.replace(/^(\|.+\|)\n(\|[-:| ]+\|)\n((?:\|.+\|\n?)*)/gm, (match, headerRow, separator, bodyRows) => {
        const headers = headerRow.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
        const rows = bodyRows.trim().split('\n').map(row => {
            const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
            return `<tr>${cells}</tr>`;
        }).join('');
        return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
    });

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Unordered lists
    html = html.replace(/^(\s*)[-*] (.+)$/gm, (match, indent, content) => {
        return `<li>${content}</li>`;
    });

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Wrap consecutive <li> in <ul>
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, (match) => {
        return `<ul>${match}</ul>`;
    });

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    // Paragraphs
    html = html.replace(/^(?!<[a-z/])((?!^\s*$).+)$/gm, (match) => {
        return `<p>${match}</p>`;
    });

    // Clean up extra whitespace
    html = html.replace(/\n{3,}/g, '\n\n');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    return html;
}

// ---- UI State Management ----
function setLoading(isLoading) {
    generateBtn.disabled = isLoading;
    btnText.style.display = isLoading ? 'none' : 'inline-flex';
    btnLoading.style.display = isLoading ? 'inline-flex' : 'none';
}

function showResults(city, state, markdownContent) {
    resultsTitle.textContent = `3-Month Sales Plan: ${city}, ${state}`;
    resultsContent.innerHTML = renderMarkdown(markdownContent);
    resultsSection.style.display = 'block';
    errorSection.style.display = 'none';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showError(message) {
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
    resultsSection.style.display = 'none';
}

function hideAll() {
    resultsSection.style.display = 'none';
    errorSection.style.display = 'none';
}

// ---- Event Handlers ----
salesForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const city = cityInput.value.trim();
    const state = stateSelect.value;

    if (!city || !state) return;

    // Check for API key before proceeding
    if (!getApiKey()) {
        showModal();
        return;
    }

    hideAll();
    setLoading(true);

    try {
        const result = await callGemini(city, state);
        showResults(city, state, result);
    } catch (err) {
        console.error('Gemini API Error:', err);
        showError(err.message || 'Failed to generate the sales plan. Please try again.');
    } finally {
        setLoading(false);
    }
});

// Retry button
retryBtn.addEventListener('click', () => {
    salesForm.dispatchEvent(new Event('submit'));
});

// Print button
printBtn.addEventListener('click', () => {
    window.print();
});

// Copy button
copyBtn.addEventListener('click', async () => {
    const text = resultsContent.innerText;
    try {
        await navigator.clipboard.writeText(text);
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"/>
            </svg>
            Copied!
        `;
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
        }, 2000);
    } catch (err) {
        // Fallback for older browsers
        const range = document.createRange();
        range.selectNodeContents(resultsContent);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('copy');
        selection.removeAllRanges();
    }
});
