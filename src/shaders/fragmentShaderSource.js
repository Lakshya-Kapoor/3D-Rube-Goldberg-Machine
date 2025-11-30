export const FRAGMENT_SHADER = `

uniform bool usePhong;
uniform sampler2D textures[9];
uniform int numLights;
uniform vec3 ka;
uniform vec3 kd;
uniform vec3 ks;
uniform float shininess;
uniform float useTexture;
uniform float textureIndex;

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

uniform Light lights[3];

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vFragPos;

// Per-object values are now uniforms, not varyings

varying vec3 vGouraudColor;

void main() {

    // texture usage based on per-object flag and texture index
    vec3 texColor = vec3(1.0);
    if (useTexture > 0.0) {
        int texIdx = int(textureIndex);
        // Sample from the appropriate texture based on index
        if (texIdx == 0) texColor = texture2D(textures[0], vUv).rgb;
        else if (texIdx == 1) texColor = texture2D(textures[1], vUv).rgb;
        else if (texIdx == 2) texColor = texture2D(textures[2], vUv).rgb;
        else if (texIdx == 3) texColor = texture2D(textures[3], vUv).rgb;
        else if (texIdx == 4) texColor = texture2D(textures[4], vUv).rgb;
        else if (texIdx == 5) texColor = texture2D(textures[5], vUv).rgb;
        else if (texIdx == 6) texColor = texture2D(textures[6], vUv).rgb;
        else if (texIdx == 7) texColor = texture2D(textures[7], vUv).rgb;
        else if (texIdx == 8) texColor = texture2D(textures[8], vUv).rgb;

    }

    if (!usePhong) {
        gl_FragColor = vec4(vGouraudColor * texColor, 1.0);
        return;
    }

    vec3 N = normalize(vNormal);
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
            spotEffect = smoothstep(lights[i].outerCutoff, lights[i].cutoff, theta);
        }
        result += ambient + (diffuse + specular) * spotEffect;
    }

    gl_FragColor = vec4(result * texColor, 1.0);
}
`;
