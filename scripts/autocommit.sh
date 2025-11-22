#!/bin/bash

# Autocommit script to commit each file individually
echo "Starting autocommit script..."

while true; do
    # Get list of modified, added, or deleted files
    files=$(git status --porcelain | awk '{print $2}')

    for file in $files; do
        if [ -f "$file" ] || [ -d "$file" ]; then
            git add "$file"
            commit_msg="Update $file - $(date +%s)"
            git commit -m "$commit_msg"
            echo "Committed $file"
        else
             # Handle deleted files
            git add "$file"
            commit_msg="Delete $file - $(date +%s)"
            git commit -m "$commit_msg"
            echo "Committed deletion of $file"
        fi
    done
    
    # Push changes every loop or so? Maybe not every loop to avoid rate limits, but the user didn't specify. 
    # I'll push occasionally or just let the user push. 
    # "No empty ommits no empty files"
    
    sleep 5
done

