'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ApiPreset,
  getPresets,
  savePreset,
  deletePreset,
  getActivePresetId,
  setActivePresetId,
  getCurrentConfig,
  setCurrentConfig,
} from '@/lib/api-presets';

export default function ApiSettingsPage() {
  const router = useRouter();
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [modelInput, setModelInput] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [presetName, setPresetName] = useState('');
  const [presets, setPresets] = useState<ApiPreset[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // 当前实际生效的模型：手动输入优先，否则用下拉选择的
  const effectiveModel = modelInput.trim() || selectedModel;

  useEffect(() => {
    setPresets(getPresets());
    setActiveId(getActivePresetId());
    // 加载当前配置回显
    const current = getCurrentConfig();
    if (current) {
      setBaseUrl(current.baseUrl);
      setApiKey(current.apiKey);
      setModelInput(current.model);
    }
  }, []);

  const fetchModels = async () => {
    if (!baseUrl || !apiKey) {
      setError('请先填写 URL 和 Key');
      return;
    }
    setLoading(true);
    setError('');
    setModels([]);
    try {
      const url = baseUrl.replace(/\/$/, '') + '/models';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) throw new Error(`请求失败: ${res.status}`);
      const data = await res.json();
      const list: string[] = (data.data || [])
        .map((m: { id: string }) => m.id)
        .sort();
      if (list.length === 0) throw new Error('未获取到模型列表');
      setModels(list);
      setSelectedModel(list[0]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '拉取失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSetCurrent = () => {
    if (!baseUrl.trim() || !apiKey.trim() || !effectiveModel) {
      setError('URL、Key、模型名称都不能为空');
      return;
    }
    setCurrentConfig({
      baseUrl: baseUrl.replace(/\/$/, ''),
      apiKey,
      model: effectiveModel,
    });
    setError('');
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      setError('请输入预设名称');
      return;
    }
    if (!effectiveModel) {
      setError('请填写或选择模型');
      return;
    }
    const preset: ApiPreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      baseUrl: baseUrl.replace(/\/$/, ''),
      apiKey,
      model: effectiveModel,
    };
    savePreset(preset);
    setActivePresetId(preset.id);
    setActiveId(preset.id);
    setCurrentConfig({ baseUrl: preset.baseUrl, apiKey: preset.apiKey, model: preset.model });
    setPresets(getPresets());
    setPresetName('');
    setError('');
  };

  const handleActivate = (id: string) => {
    setActivePresetId(id);
    setActiveId(id);
    const p = getPresets().find((x) => x.id === id);
    if (p) {
      setBaseUrl(p.baseUrl);
      setApiKey(p.apiKey);
      setModelInput(p.model);
      setSelectedModel(p.model);
      setModels([]);
      setCurrentConfig({ baseUrl: p.baseUrl, apiKey: p.apiKey, model: p.model });
    }
  };

  const handleDelete = (id: string) => {
    deletePreset(id);
    setPresets(getPresets());
    if (activeId === id) setActiveId(null);
  };

  return (
    <div className="px-4 py-6">
      <div className="mx-auto max-w-md">
        {/* 返回 */}
        <button
          onClick={() => router.back()}
          className="mb-4 text-[14px] text-gray-400 hover:text-gray-600"
        >
          ← 返回
        </button>

        <h1 className="mb-6 text-xl font-semibold text-gray-900">API 配置</h1>

        {/* 输入区 */}
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-[13px] text-gray-500">Base URL</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com/v1"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-[14px] text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-[13px] text-gray-500">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-[14px] text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 focus:bg-white"
            />
          </div>

          {/* 模型名称 - 手动输入 */}
          <div>
            <label className="mb-1 block text-[13px] text-gray-500">模型名称</label>
            <input
              type="text"
              value={modelInput}
              onChange={(e) => setModelInput(e.target.value)}
              placeholder="手动输入，或通过下方拉取列表选择"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-[14px] text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 focus:bg-white"
            />
          </div>

          {/* 拉取模型（可选辅助） */}
          <div className="flex items-center gap-2">
            <button
              onClick={fetchModels}
              disabled={loading}
              className="rounded-lg bg-gray-100 px-4 py-2 text-[13px] text-gray-700 transition-opacity hover:bg-gray-200 disabled:opacity-50"
            >
              {loading ? '拉取中...' : '拉取模型列表'}
            </button>
            <span className="text-[12px] text-gray-400">可选，不知道模型名时用</span>
          </div>

          {/* 模型下拉选择（拉取后显示） */}
          {models.length > 0 && (
            <div>
              <label className="mb-1 block text-[13px] text-gray-500">从列表选择</label>
              <select
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  setModelInput(e.target.value);
                }}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-[14px] text-gray-900 outline-none focus:border-gray-400"
              >
                {models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-[13px] text-red-500">{error}</p>}

          {/* 设为当前配置 - 主按钮 */}
          <button
            onClick={handleSetCurrent}
            className="mt-2 rounded-lg bg-gray-900 px-4 py-2.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
          >
            {saved ? '✓ 已保存' : '设为当前配置'}
          </button>
        </div>

        {/* 保存为预设 - 可选 */}
        <div className="mt-6 rounded-xl border border-gray-200 p-4">
          <p className="mb-2 text-[13px] text-gray-500">保存为预设（可选）</p>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="给这套配置取个名"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-[14px] text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 focus:bg-white"
              />
            </div>
            <button
              onClick={handleSavePreset}
              className="shrink-0 rounded-lg bg-gray-100 px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-gray-200"
            >
              保存预设
            </button>
          </div>
        </div>

        {/* 预设列表 - 始终展示 */}
        {presets.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-[14px] font-medium text-gray-500">已保存的预设</h2>
            <div className="flex flex-col gap-2">
              {presets.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
                    activeId === p.id
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-[12px] text-gray-400 truncate">{p.model}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {activeId !== p.id && (
                      <button
                        onClick={() => handleActivate(p.id)}
                        className="rounded-md bg-gray-100 px-3 py-1.5 text-[12px] text-gray-700 hover:bg-gray-200"
                      >
                        激活
                      </button>
                    )}
                    {activeId === p.id && (
                      <span className="text-[12px] text-gray-900 font-medium">当前</span>
                    )}
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="rounded-md px-2 py-1.5 text-[12px] text-red-400 hover:text-red-600"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
