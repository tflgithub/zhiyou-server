# 使用 Node.js 官方镜像
FROM node:20-slim

WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY tsconfig.json ./
COPY src/ ./src/

# 暴露端口
EXPOSE 3001

# 启动命令（使用 npx tsx --esm 避免加载问题）
CMD ["npx", "tsx", "src/index.ts"]
