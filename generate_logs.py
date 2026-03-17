import random
import datetime
import urllib.request
import urllib.error
import json
import os

def generate_logs(num_lines=10000):
    start_time = datetime.datetime.now()
    
    normal_templates = [
        "INFO Block {id} replicated successfully",
        "INFO User {user} login successful",
        "INFO Memory usage normal at {mem}%",
        "INFO Worker thread {id} started",
        "INFO Configuration loaded successfully",
        "DEBUG Processing record {id}",
        "INFO Health check passed",
        "INFO Serving request from {ip}"
    ]
    
    def block_db_failure(time):
        return f"{time} ERROR Database connection failed: connection refused"
        
    def block_brute_force(time):
        return f"{time} WARN Brute force attempt detected from 192.168.1.50"
        
    def block_unauthorized(time):
        return f"{time} ERROR Unauthorized access attempt to /admin"
        
    def block_sql_injection(time):
        return f"{time} CRITICAL SQL injection attempt detected in payload"
        
    def block_suspicious_ip(time):
        return f"{time} WARN Authentication failed from internal IP 10.0.0.5"

    def block_unseen_anomaly(time):
        return f"{time} ERROR Transdimensional flux capacitor overload detected"
    
    logs = []
    
    i = 0
    while i < num_lines:
        time_str = start_time.strftime("%Y-%m-%d %H:%M:%S")
        start_time += datetime.timedelta(seconds=random.randint(1, 5))
        
        # ~5% chance to insert an anomaly
        if random.random() < 0.05:
            anomaly_type = random.choice([1, 2, 3, 4, 5, 6, 7])
            if anomaly_type == 1 and i + 3 <= num_lines:
                logs.append(f"{time_str} WARN Authentication failed for user admin")
                for _ in range(2):
                    start_time += datetime.timedelta(seconds=1)
                    time_str = start_time.strftime("%Y-%m-%d %H:%M:%S")
                    logs.append(f"{time_str} WARN Authentication failed for user admin")
                    i += 1
                i += 1
            elif anomaly_type == 2:
                logs.append(block_brute_force(time_str))
                i += 1
            elif anomaly_type == 3:
                logs.append(block_db_failure(time_str))
                i += 1
            elif anomaly_type == 4:
                logs.append(block_unauthorized(time_str))
                i += 1
            elif anomaly_type == 5:
                logs.append(block_sql_injection(time_str))
                i += 1
            elif anomaly_type == 6:
                logs.append(block_suspicious_ip(time_str))
                i += 1
            elif anomaly_type == 7:
                logs.append(block_unseen_anomaly(time_str))
                i += 1
            else:
                tmpl = random.choice(normal_templates)
                logs.append(f"{time_str} " + tmpl.format(
                    id=random.randint(100, 999), 
                    user=f"user_{random.randint(1, 100)}",
                    mem=random.randint(20, 60),
                    ip=f"{random.randint(11, 99)}.{random.randint(1, 255)}.{random.randint(1, 255)}.1"
                ))
                i += 1
        else:
            tmpl = random.choice(normal_templates)
            logs.append(f"{time_str} " + tmpl.format(
                id=random.randint(100, 999), 
                user=f"user_{random.randint(1, 100)}",
                mem=random.randint(20, 60),
                ip=f"{random.randint(11, 99)}.{random.randint(1, 255)}.{random.randint(1, 255)}.1"
            ))
            i += 1
            
    # Save the file
    i += 1
    filepath = os.path.join("datasets", f"logs_{i}.txt")
    with open(filepath, "w") as f:
        f.write("\n".join(logs))
        
    print(f"Generated {len(logs)} logs to {filepath}.")
    return logs

def send_to_backend_and_evaluate(logs):
    url = "http://localhost:8000/ingest"
    # Chunking manually if payload is too big, but FastAPI should handle a few MBs fine.
    payload = {"content": "\n".join(logs)}
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode())
            print("Ingest Response:", res_data)
            
        # Get stats
        with urllib.request.urlopen("http://localhost:8000/stats") as response:
            stats = json.loads(response.read().decode())
            print("\nBackend Stats:")
            print(json.dumps(stats, indent=2))
            
        # Get recent anomalies to count rule triggers
        with urllib.request.urlopen("http://localhost:8000/logs") as response:
            logs_response = json.loads(response.read().decode())
            all_processed_logs = logs_response.get("logs", [])
            
        rule_counts = {}
        ml_only_count = 0
        rule_only_count = 0
        ml_and_rule_count = 0
        
        for log in all_processed_logs:
            if log.get("prediction") == "Anomaly":
                reason = log.get("detection_reason", "")
                source = log.get("source", "")
                
                if source == "ML":
                    ml_only_count += 1
                elif source == "Rules":
                    rule_only_count += 1
                elif "ML" in source and "Rules" in source:
                    ml_and_rule_count += 1
                
                if source != "ML":
                    # For rule triggers
                    rule_counts[reason] = rule_counts.get(reason, 0) + 1
                    
        print("\n=== Anomaly Breakdown ===")
        print(f"ML Only Anomalies: {ml_only_count}")
        print(f"Rule Only Anomalies: {rule_only_count}")
        print(f"ML + Rule Anomalies: {ml_and_rule_count}")
        
        print("\n=== Rule Triggers ===")
        for rule, count in rule_counts.items():
            print(f"  - {rule}: {count}")
            
    except urllib.error.URLError as e:
        print("Error communicating with backend:", e)

if __name__ == "__main__":
    logs = generate_logs(10000)
    send_to_backend_and_evaluate(logs)
