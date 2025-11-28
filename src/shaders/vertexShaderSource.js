export const VERTEX_SHADER = `

uniform bool usePhong;
uniform int numLights;

struct Light {
    vec3 position;
    vec3 Ia;
    vec3 Id;
    vec3 Is;
    float kc;
    float kl;
    float kq;
    bool on;
    bool spotLight;
    vec3 direction;
    float cutoff;
    float outerCutoff;
};

uniform Light lights[4];

uniform vec3 ka;
uniform vec3 kd;
uniform vec3 ks;
uniform float shininess;
uniform float useTexture;
uniform float textureIndex;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vFragPos;

// Pass per-object attributes forward
// removed per-object material varyings; fragment will use uniforms directly

varying vec3 vGouraudColor;

void main() {

    vUv = uv;
    vFragPos = (modelMatrix * vec4(position, 1.0)).xyz;
    vNormal = normalize(mat3(transpose(inverse(modelMatrix))) * normal);

    // material comes from uniforms; no need to pass via varyings

    if (!usePhong) {

        vec3 N = vNormal;
        vec3 V = normalize(cameraPosition - vFragPos);

        vec3 result = vec3(0.0);

        for (int i = 0; i < numLights; i++) {
            if (!lights[i].on) {
                continue;
            }
            vec3 L = normalize(lights[i].position - vFragPos);
            vec3 H = normalize(L + V);

            float diff = max(dot(N, L), 0.0);
            float spec = 0.0;

            if (diff > 0.0) {
                spec = pow(max(dot(N, H), 0.0), shininess);
            }

            float distanceToLight = length(lights[i].position - vFragPos);
            float attenuation = 1.0 / (lights[i].kc +
                           lights[i].kl * distanceToLight +
                           lights[i].kq * distanceToLight * distanceToLight);

            vec3 ambient  = ka * lights[i].Ia;
            vec3 diffuse  = kd * diff * lights[i].Id * attenuation;
            vec3 specular = ks * spec * lights[i].Is * attenuation;

            float spotEffect = 1.0;
            if (lights[i].spotLight) {
                float theta = dot(L, normalize(-lights[i].direction));
                if (theta > lights[i].cutoff) {
                    spotEffect = 1.0;
                } else if (theta < lights[i].outerCutoff) {
                    spotEffect = 0.0;
                } else {
                    spotEffect = 0.4;
                }
            }
            result += ambient + (diffuse + specular) * spotEffect;
        }

        vGouraudColor = result;
    }

    gl_Position = projectionMatrix * viewMatrix * vec4(vFragPos, 1.0);
}
`;
