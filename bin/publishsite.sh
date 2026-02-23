#git subtree push --prefix build/virtualbody origin gh-pages
#using https://github.com/X1011/git-directory-deploy
export GIT_DEPLOY_DIR=../dist
export GIT_DEPLOY_REPO=git@github.com:creative-connections/Bodylight-VirtualBody.git
./deploy.sh
