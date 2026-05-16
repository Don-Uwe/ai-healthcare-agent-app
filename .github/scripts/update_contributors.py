import sys
import os
import re
import json
import urllib.request
import html
from urllib.error import URLError

def get_user_info(username):
    """Fetch user name and avatar from GitHub API."""
    url = f"https://api.github.com/users/{username}"
    # Standard User-Agent is required by GitHub API
    headers = {'User-Agent': 'Python-urllib'}
    if 'GITHUB_TOKEN' in os.environ:
        headers['Authorization'] = f"Bearer {os.environ['GITHUB_TOKEN']}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                # Fallback to username if name is not set
                name = data.get('name') or username
                avatar_url = data.get('avatar_url')
                return name, avatar_url
    except Exception as e:
        print(f"Warning: Failed to fetch user info from GitHub API: {e}")
    
    # Fallback to standard URL patterns if API fails
    return username, f"https://github.com/{username}.png"

def update_readme(username):
    readme_path = 'README.md'
    
    try:
        with open(readme_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: {readme_path} not found.")
        sys.exit(1)

    # Prevent duplicates - check if username is already in the file
    if re.search(rf'github\.com/{re.escape(username)}["/]', content, re.IGNORECASE):
        print(f"User {username} is already in the contributors list.")
        return

    name, avatar_url = get_user_info(username)
    
    # Sanitize inputs to prevent HTML breakage
    name = html.escape(str(name))
    avatar_url = html.escape(str(avatar_url))
    
    # Generate the <td> snippet
    new_td = f'    <td align="center"><a href="https://github.com/{username}"><img src="{avatar_url}" width="120px;" alt=""/><br/><sub><b>{name}</b></sub></a></td>'

    # Locate the contributors table using HTML comment markers
    start_marker = '<!-- CONTRIBUTORS-TABLE-START -->'
    end_marker = '<!-- CONTRIBUTORS-TABLE-END -->'
    
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)

    if start_idx == -1 or end_idx == -1:
        print("Warning: Could not find the contributors table markers. Skipping.")
        sys.exit(0)

    table_start = start_idx + len(start_marker)
    table_end = end_idx

    table_content = content[table_start:table_end]
    
    # Find all <tr>...</tr> blocks
    trs = re.findall(r'(<tr>.*?</tr>)', table_content, flags=re.DOTALL | re.IGNORECASE)
    
    if not trs:
        # If the table has no rows, create the first one
        new_tr = f"  <tr>\n{new_td}\n  </tr>\n"
        updated_table = table_content + new_tr
    else:
        last_tr = trs[-1]
        # Count existing <td> tags in the last row
        tds = re.findall(r'(<td.*?</td>)', last_tr, flags=re.DOTALL | re.IGNORECASE)
        
        if len(tds) < 6:
            # Append inside the last <tr>, right before </tr>
            insertion_point = last_tr.lower().rfind('</tr>')
            if insertion_point == -1:
                insertion_point = len(last_tr) - 5
                
            updated_last_tr = last_tr[:insertion_point] + new_td + '\n ' + last_tr[insertion_point:]
            # Replace only the last occurrence of last_tr to avoid changing identical earlier rows
            head, sep, tail = table_content.rpartition(last_tr)
            updated_table = head + updated_last_tr + tail
        else:
            # The last <tr> is full, append a new <tr> complete with the <td>
            new_tr = f"   <tr>\n{new_td}\n   </tr>"
            # Insert the new row directly after the last row; only replace the final occurrence
            head, sep, tail = table_content.rpartition(last_tr)
            updated_table = head + (last_tr + '\n\n' + new_tr) + tail
             
    # Stitch the file back together
    new_readme_content = content[:table_start] + updated_table + content[table_end:]
    
    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(new_readme_content)
        
    print(f"Successfully added {username} to contributors in README.md.")

def main():
    if len(sys.argv) < 2:
        print("Usage: python update_contributors.py <username>")
        sys.exit(1)

    # Strip the '@' just in case it gets passed in
    username = sys.argv[1].lstrip('@')

    update_readme(username)


if __name__ == '__main__':
    main()
