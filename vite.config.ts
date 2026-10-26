import { defineConfig } from 'vite';
import { get_positions, read_request_body, write_file } from './src/backend/api.ts';

export default defineConfig({
    plugins: [
        {
            name: 'api-routes',
            configureServer(server) {
                server.middlewares.use('/api/positions', async (request, result) => {
                    result.setHeader('Content-Type', 'application/json');

                    if (request.method === 'GET') {
                        const positions = get_positions();
                        result.end(positions);
                    } else if (request.method === 'POST') {
                        const positions = await read_request_body(request);
                        write_file('positions.json', positions);
                        result.end(JSON.stringify({ message: "Successfully received positions :)"}));
                    } else {
                        result.statusCode = 405;
                        result.setHeader('Allow', 'GET, POST');
                        result.end(JSON.stringify({ message: "Method not allowed" }));
                    }

                });
            }
        }
    ]
})