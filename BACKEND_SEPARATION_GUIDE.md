# 🔄 Backend Repository Separation Guide

## Current Status
✅ Backend code extracted to `backend-only` branch with full Git history
✅ Branch ready to push to new repository

## Next Steps (Manual)

### 1. Create New Repository on GitHub
1. Go to https://github.com/Enochthedev
2. Click "New repository"
3. Repository name: `ProjectHub-backend`
4. Make it public
5. **Don't initialize** with README, .gitignore, or license
6. Click "Create repository"

### 2. Push Backend Code to New Repository
After creating the repository, run these commands:

\`\`\`bash
# Make sure you're on the backend-only branch
git checkout backend-only

# Add the new repository as remote
git remote add backend-repo https://github.com/Enochthedev/ProjectHub-backend.git

# Push the backend code to the new repository
git push backend-repo backend-only:main
\`\`\`

### 3. Verify New Repository
The new repository should contain:
- All backend source code
- Complete Git history for backend files
- render.yaml for Render deployment
- All backend documentation
- Environment configuration files

### 4. Update Render Configuration
1. Go to Render dashboard
2. Create new Blueprint deployment
3. Connect to `ProjectHub-backend` repository
4. Deploy using the render.yaml file

### 5. Clean Up Frontend Repository
After successful backend deployment:

\`\`\`bash
# Switch back to main branch
git checkout main

# Remove backend directory from frontend repo
git rm -rf backend/
git commit -m "Remove backend - moved to separate repository"
git push origin main
\`\`\`

### 6. Update Frontend API Configuration
Update `.env.development` to point to the new backend URL:
\`\`\`bash
NEXT_PUBLIC_API_URL=https://your-backend-name.onrender.com
\`\`\`

## Benefits of Separation
- ✅ Clean repository structure
- ✅ Independent deployment pipelines
- ✅ Render Blueprint works correctly
- ✅ Better CI/CD organization
- ✅ Easier team collaboration
- ✅ Separate versioning and releases

## Repository URLs After Separation
- **Frontend**: https://github.com/Enochthedev/Project-Hub-frontend
- **Backend**: https://github.com/Enochthedev/ProjectHub-backend

## Deployment URLs
- **Frontend**: https://project-hub-frontend.onrender.com
- **Backend**: https://project-hub-backend.onrender.com
