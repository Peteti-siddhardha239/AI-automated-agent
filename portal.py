from flask import Flask, render_template_string, request, redirect, url_for, session, jsonify
import os
import json
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = "sentinel_secure_antivirus_portal_key_xyz"

USERS_DB = "users_db.json"

def load_users():
    if os.path.exists(USERS_DB):
        try:
            with open(USERS_DB, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            pass
    # Default initial Admin and User
    default_users = {
        "admin@sentinel.com": {
            "name": "System Administrator",
            "email": "admin@sentinel.com",
            "password": generate_password_hash("admin123"),
            "role": "admin",
            "provider": "email"
        },
        "user@sentinel.com": {
            "name": "Standard User",
            "email": "user@sentinel.com",
            "password": generate_password_hash("user123"),
            "role": "user",
            "provider": "email"
        }
    }
    save_users(default_users)
    return default_users

def save_users(users):
    try:
        with open(USERS_DB, "w", encoding="utf-8") as f:
            json.dump(users, f, indent=2)
    except Exception as e:
        print(f"Error saving users: {e}")

HTML_LOGIN_SIGNUP = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sentinel Antivirus - Authentication</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body { background: #0f172a; color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center p-6">
    <div class="max-w-md w-full glass rounded-2xl shadow-2xl p-8 space-y-6">
        <div class="text-center space-y-2">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 bg-opacity-20 text-blue-400 text-3xl mb-2">
                <i class="fas fa-shield-alt"></i>
            </div>
            <h1 class="text-2xl font-bold tracking-wide">Sentinel Endpoint Security</h1>
            <p class="text-sm text-gray-400">Real-Time Autonomous Antivirus Portal</p>
        </div>

        {% if error %}
        <div class="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
            <i class="fas fa-exclamation-circle"></i>
            <span>{{ error }}</span>
        </div>
        {% endif %}

        {% if success %}
        <div class="bg-green-500 bg-opacity-20 border border-green-500 text-green-300 px-4 py-3 rounded-lg text-sm flex items-center space-x-2">
            <i class="fas fa-check-circle"></i>
            <span>{{ success }}</span>
        </div>
        {% endif %}

        <!-- Tabs -->
        <div class="flex rounded-lg bg-gray-900 p-1 border border-gray-700">
            <button onclick="switchTab('login')" id="btn-login" class="flex-1 py-2 text-sm font-semibold rounded-md transition bg-blue-600 text-white">Login</button>
            <button onclick="switchTab('signup')" id="btn-signup" class="flex-1 py-2 text-sm font-semibold rounded-md transition text-gray-400 hover:text-white">Sign Up</button>
        </div>

        <!-- Login Form -->
        <form id="form-login" method="POST" action="/login" class="space-y-4">
            <input type="hidden" name="action" value="login">
            <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Email Address</label>
                <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500"><i class="fas fa-envelope"></i></span>
                    <input type="email" name="email" required placeholder="name@example.com" class="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm">
                </div>
            </div>
            <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Password</label>
                <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500"><i class="fas fa-lock"></i></span>
                    <input type="password" name="password" required placeholder="••••••••" class="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm">
                </div>
            </div>
            <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg transition duration-200 text-sm">Sign In to Dashboard</button>
        </form>

        <!-- Signup Form -->
        <form id="form-signup" method="POST" action="/signup" class="space-y-4 hidden">
            <input type="hidden" name="action" value="signup">
            <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Full Name</label>
                <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500"><i class="fas fa-user"></i></span>
                    <input type="text" name="name" required placeholder="John Doe" class="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm">
                </div>
            </div>
            <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Email Address</label>
                <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500"><i class="fas fa-envelope"></i></span>
                    <input type="email" name="email" required placeholder="name@example.com" class="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm">
                </div>
            </div>
            <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Password</label>
                <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500"><i class="fas fa-lock"></i></span>
                    <input type="password" name="password" required placeholder="••••••••" class="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm">
                </div>
            </div>
            <button type="submit" class="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg shadow-lg transition duration-200 text-sm">Create User Account</button>
        </form>

        <!-- OAuth Social Buttons -->
        <div class="space-y-3 pt-2">
            <div class="relative flex py-2 items-center">
                <div class="flex-grow border-t border-gray-700"></div>
                <span class="flex-shrink mx-4 text-xs text-gray-500 uppercase">Or continue with</span>
                <div class="flex-grow border-t border-gray-700"></div>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <a href="/oauth/google" class="flex items-center justify-center px-4 py-2.5 border border-gray-700 rounded-lg bg-gray-900 hover:bg-gray-800 text-sm font-medium transition space-x-2">
                    <i class="fab fa-google text-red-500"></i>
                    <span>Google</span>
                </a>
                <a href="/oauth/github" class="flex items-center justify-center px-4 py-2.5 border border-gray-700 rounded-lg bg-gray-900 hover:bg-gray-800 text-sm font-medium transition space-x-2">
                    <i class="fab fa-github text-white"></i>
                    <span>GitHub</span>
                </a>
            </div>
        </div>

        <div class="text-center text-xs text-gray-500 pt-2">
            Default Admin: <span class="text-blue-400 font-mono">admin@sentinel.com</span> / <span class="text-blue-400 font-mono">admin123</span><br>
            Default User: <span class="text-blue-400 font-mono">user@sentinel.com</span> / <span class="text-blue-400 font-mono">user123</span>
        </div>
    </div>

    <script>
        function switchTab(tab) {
            const loginForm = document.getElementById('form-login');
            const signupForm = document.getElementById('form-signup');
            const btnLogin = document.getElementById('btn-login');
            const btnSignup = document.getElementById('btn-signup');

            if (tab === 'login') {
                loginForm.classList.remove('hidden');
                signupForm.classList.add('hidden');
                btnLogin.className = "flex-1 py-2 text-sm font-semibold rounded-md transition bg-blue-600 text-white";
                btnSignup.className = "flex-1 py-2 text-sm font-semibold rounded-md transition text-gray-400 hover:text-white";
            } else {
                signupForm.classList.remove('hidden');
                loginForm.classList.add('hidden');
                btnSignup.className = "flex-1 py-2 text-sm font-semibold rounded-md transition bg-green-600 text-white";
                btnLogin.className = "flex-1 py-2 text-sm font-semibold rounded-md transition text-gray-400 hover:text-white";
            }
        }
    </script>
</body>
</html>
"""

HTML_DASHBOARD = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sentinel Antivirus - Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body { background: #0f172a; color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }
    </style>
</head>
<body class="min-h-screen flex flex-col">
    <!-- Navbar -->
    <nav class="glass border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xl">
                <i class="fas fa-shield-alt"></i>
            </div>
            <div>
                <h1 class="font-bold text-lg leading-tight">Sentinel Antivirus Console</h1>
                <p class="text-xs text-gray-400">Endpoint Security & Real-Time Threat Vault</p>
            </div>
        </div>
        <div class="flex items-center space-x-4">
            <div class="text-right">
                <p class="text-sm font-semibold">{{ user.name }}</p>
                <span class="text-xs px-2 py-0.5 rounded uppercase font-bold {% if user.role == 'admin' %}bg-purple-600 text-purple-100{% else %}bg-blue-600 text-blue-100{% endif %}">{{ user.role }}</span>
            </div>
            <a href="/logout" class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition"><i class="fas fa-sign-out-alt mr-1"></i> Logout</a>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1 p-8 max-w-7xl mx-auto w-full space-y-6">
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="glass p-6 rounded-2xl flex items-center space-x-4">
                <div class="w-12 h-12 rounded-xl bg-blue-500 bg-opacity-20 text-blue-400 flex items-center justify-center text-2xl"><i class="fas fa-server"></i></div>
                <div>
                    <p class="text-xs text-gray-400 uppercase font-semibold">Agent Status</p>
                    <p class="text-lg font-bold text-green-400">ACTIVE</p>
                </div>
            </div>
            <div class="glass p-6 rounded-2xl flex items-center space-x-4">
                <div class="w-12 h-12 rounded-xl bg-green-500 bg-opacity-20 text-green-400 flex items-center justify-center text-2xl"><i class="fas fa-search"></i></div>
                <div>
                    <p class="text-xs text-gray-400 uppercase font-semibold">Scanned Files</p>
                    <p class="text-lg font-bold" id="stat-scanned">38,083</p>
                </div>
            </div>
            <div class="glass p-6 rounded-2xl flex items-center space-x-4">
                <div class="w-12 h-12 rounded-xl bg-red-500 bg-opacity-20 text-red-400 flex items-center justify-center text-2xl"><i class="fas fa-bug"></i></div>
                <div>
                    <p class="text-xs text-gray-400 uppercase font-semibold">Threats Neutralized</p>
                    <p class="text-lg font-bold text-red-400" id="stat-threats">4</p>
                </div>
            </div>
            <div class="glass p-6 rounded-2xl flex items-center space-x-4">
                <div class="w-12 h-12 rounded-xl bg-purple-500 bg-opacity-20 text-purple-400 flex items-center justify-center text-2xl"><i class="fas fa-user-shield"></i></div>
                <div>
                    <p class="text-xs text-gray-400 uppercase font-semibold">Logged-in Role</p>
                    <p class="text-lg font-bold uppercase">{{ user.role }}</p>
                </div>
            </div>
        </div>

        {% if user.role == 'admin' %}
        <!-- Admin Panel: User Management -->
        <div class="glass rounded-2xl p-6 space-y-4">
            <h2 class="text-lg font-bold flex items-center space-x-2"><i class="fas fa-users-cog text-blue-400"></i><span>Admin Portal: Registered Users Database</span></h2>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-gray-900 uppercase text-xs text-gray-400">
                        <tr>
                            <th class="p-3">Name</th>
                            <th class="p-3">Email</th>
                            <th class="p-3">Role</th>
                            <th class="p-3">Provider</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-800">
                        {% for email, u in all_users.items() %}
                        <tr class="hover:bg-gray-800 transition">
                            <td class="p-3 font-semibold">{{ u.name }}</td>
                            <td class="p-3 text-gray-300">{{ u.email }}</td>
                            <td class="p-3"><span class="px-2 py-0.5 rounded text-xs font-bold uppercase {% if u.role == 'admin' %}bg-purple-600 text-purple-100{% else %}bg-blue-600 text-blue-100{% endif %}">{{ u.role }}</span></td>
                            <td class="p-3 uppercase text-xs text-gray-400">{{ u.provider }}</td>
                        </tr>
                        {% endfor %}
                    </tbody>
                </table>
            </div>
        </div>
        {% endif %}

        <!-- Threats Quarantine Vault Table -->
        <div class="glass rounded-2xl p-6 space-y-4">
            <h2 class="text-lg font-bold flex items-center space-x-2"><i class="fas fa-vault text-red-400"></i><span>Quarantine Vault & Detected Threats Log</span></h2>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-gray-900 uppercase text-xs text-gray-400">
                        <tr>
                            <th class="p-3">Timestamp</th>
                            <th class="p-3">Threat Name</th>
                            <th class="p-3">Severity</th>
                            <th class="p-3">Original Path</th>
                            <th class="p-3">Action Taken</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-800">
                        {% for t in threats %}
                        <tr class="hover:bg-gray-800 transition">
                            <td class="p-3 text-gray-400">{{ t.timestamp }}</td>
                            <td class="p-3 font-semibold text-red-400">{{ t.threat_name }}</td>
                            <td class="p-3"><span class="px-2 py-0.5 rounded text-xs font-bold bg-red-600 text-white">{{ t.severity }}</span></td>
                            <td class="p-3 font-mono text-xs text-gray-300 truncate max-w-xs">{{ t.original_path }}</td>
                            <td class="p-3 text-green-400 text-xs font-semibold">{{ t.action }}</td>
                        </tr>
                        {% endfor %}
                    </tbody>
                </table>
            </div>
        </div>
    </main>
</body>
</html>
"""

@app.route("/")
def index():
    if "user" in session:
        return redirect(url_for("dashboard"))
    return render_template_string(HTML_LOGIN_SIGNUP)

@app.route("/login", methods=["POST"])
def login():
    email = request.form.get("email", "").strip().lower()
    password = request.form.get("password", "")
    users = load_users()

    if email in users and check_password_hash(users[email]["password"], password):
        session["user"] = users[email]
        return redirect(url_for("dashboard"))
    
    return render_template_string(HTML_LOGIN_SIGNUP, error="Invalid email or password.")

@app.route("/signup", methods=["POST"])
def signup():
    name = request.form.get("name", "").strip()
    email = request.form.get("email", "").strip().lower()
    password = request.form.get("password", "")
    users = load_users()

    if email in users:
        return render_template_string(HTML_LOGIN_SIGNUP, error="Email already registered. Please login.")

    users[email] = {
        "name": name,
        "email": email,
        "password": generate_password_hash(password),
        "role": "user",
        "provider": "email"
    }
    save_users(users)
    return render_template_string(HTML_LOGIN_SIGNUP, success="Account created successfully! You can now log in.")

@app.route("/oauth/<provider>")
def oauth_login(provider):
    # Simulated OAuth login for Google / GitHub
    email = f"demo_{provider}_user@sentinel.com"
    users = load_users()
    if email not in users:
        users[email] = {
            "name": f"Demo {provider.capitalize()} User",
            "email": email,
            "password": generate_password_hash("oauth123"),
            "role": "user",
            "provider": provider
        }
        save_users(users)
    session["user"] = users[email]
    return redirect(url_for("dashboard"))

@app.route("/dashboard")
def dashboard():
    if "user" not in session:
        return redirect(url_for("index"))
    
    users = load_users()
    threats = []
    if os.path.exists("threats_detected.json"):
        try:
            with open("threats_detected.json", "r", encoding="utf-8") as f:
                threats = json.load(f)
        except:
            pass

    return render_template_string(HTML_DASHBOARD, user=session["user"], all_users=users, threats=threats)

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))

if __name__ == "__main__":
    print("[*] Starting Sentinel Antivirus Web Portal with Login & Signup on http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=False)
