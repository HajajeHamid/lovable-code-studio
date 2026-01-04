import React, { useState } from 'react';
import { 
  Rocket, Server, Globe, CheckCircle, AlertTriangle, 
  Terminal, Play, TestTube, Download, Loader2, 
  FolderTree, Database, Code, GitBranch, Package,
  FileCode, Zap, Copy, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { TPFile, ValidationResult, validateTPFile } from '@/lib/tpBlocks';
import { toast } from 'sonner';

interface GenerationPanelProps {
  files: TPFile[];
  onClose: () => void;
}

interface GenerationStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
}

interface GeneratedProject {
  type: 'backend' | 'frontend';
  files: { path: string; content: string }[];
  commands: {
    install: string[];
    run: string[];
    test: string[];
    build: string[];
  };
}

const GenerationPanel: React.FC<GenerationPanelProps> = ({ files, onClose }) => {
  const [activeTab, setActiveTab] = useState<'validate' | 'generate' | 'commands'>('validate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);
  const [generatedProjects, setGeneratedProjects] = useState<GeneratedProject[]>([]);
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  // Validate all files
  const handleValidateAll = () => {
    const results: Record<string, ValidationResult> = {};
    files.forEach(file => {
      results[file.id] = validateTPFile(file);
    });
    setValidationResults(results);
    
    const totalErrors = Object.values(results).reduce((acc, r) => acc + r.errors.length, 0);
    const totalWarnings = Object.values(results).reduce((acc, r) => acc + r.warnings.length, 0);
    
    if (totalErrors === 0 && totalWarnings === 0) {
      toast.success('Tous les fichiers sont valides !');
    } else {
      toast.warning(`${totalErrors} erreur(s), ${totalWarnings} avertissement(s)`);
    }
  };

  // Validate relations between files
  const handleValidateRelations = () => {
    const issues: string[] = [];
    
    // Check if database models are referenced in backend
    const databaseFile = files.find(f => f.type === 'database');
    const backendFile = files.find(f => f.type === 'backend');
    const frontendFile = files.find(f => f.type === 'frontend');
    
    const dataModels = databaseFile?.blocks.filter(b => b.type === '@DataModel').map(b => b.params.name) || [];
    
    // Check backend references
    if (backendFile && dataModels.length > 0) {
      const backendContent = JSON.stringify(backendFile.blocks);
      dataModels.forEach(model => {
        if (model && !backendContent.includes(model)) {
          issues.push(`Modèle "${model}" non utilisé dans le backend`);
        }
      });
    }
    
    // Check frontend references
    if (frontendFile && dataModels.length > 0) {
      const frontendContent = JSON.stringify(frontendFile.blocks);
      dataModels.forEach(model => {
        if (model && !frontendContent.includes(model)) {
          issues.push(`Modèle "${model}" non référencé dans le frontend`);
        }
      });
    }
    
    if (issues.length === 0) {
      toast.success('Toutes les relations sont valides !');
    } else {
      toast.warning(`${issues.length} problème(s) de relation détecté(s)`);
    }
    
    return issues;
  };

  // Generate complete projects
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedProjects([]);
    
    const steps: GenerationStep[] = [
      { id: 'validate', label: 'Validation des fichiers TP', status: 'pending' },
      { id: 'relations', label: 'Vérification des relations', status: 'pending' },
      { id: 'schema', label: 'Génération du schéma Prisma', status: 'pending' },
      { id: 'backend', label: 'Génération du backend NestJS', status: 'pending' },
      { id: 'frontend', label: 'Génération du frontend NextJS', status: 'pending' },
      { id: 'config', label: 'Configuration des projets', status: 'pending' },
      { id: 'finalize', label: 'Finalisation', status: 'pending' },
    ];
    
    setGenerationSteps(steps);
    
    const updateStep = (id: string, status: GenerationStep['status'], message?: string) => {
      setGenerationSteps(prev => prev.map(s => s.id === id ? { ...s, status, message } : s));
    };
    
    // Simulate generation process
    for (let i = 0; i < steps.length; i++) {
      updateStep(steps[i].id, 'running');
      await new Promise(r => setTimeout(r, 800));
      
      if (steps[i].id === 'validate') {
        handleValidateAll();
      }
      
      updateStep(steps[i].id, 'success');
      setGenerationProgress(((i + 1) / steps.length) * 100);
    }
    
    // Generate project structures
    const backendProject = generateBackendProject(files);
    const frontendProject = generateFrontendProject(files);
    
    setGeneratedProjects([backendProject, frontendProject]);
    setIsGenerating(false);
    setActiveTab('commands');
    toast.success('Projets générés avec succès !');
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCommand(cmd);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const downloadProject = (project: GeneratedProject) => {
    // Create a zip-like structure as JSON for demo
    const content = JSON.stringify(project.files, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.type}-project.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Projet ${project.type} téléchargé`);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Rocket className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Générateur de Projets</h2>
              <p className="text-sm text-muted-foreground">
                Valider, générer et déployer vos projets TP
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fermer
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-4">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="validate" className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Validation
              </TabsTrigger>
              <TabsTrigger value="generate" className="gap-2">
                <Code className="w-4 h-4" />
                Génération
              </TabsTrigger>
              <TabsTrigger value="commands" className="gap-2">
                <Terminal className="w-4 h-4" />
                Commandes
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-6 py-4">
            {/* Validation Tab */}
            <TabsContent value="validate" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleValidateAll} className="h-auto py-4 flex-col gap-2">
                  <CheckCircle className="w-6 h-6" />
                  <span>Valider les formats</span>
                  <span className="text-xs opacity-70">Vérifier la syntaxe de tous les blocs</span>
                </Button>
                
                <Button onClick={handleValidateRelations} variant="outline" className="h-auto py-4 flex-col gap-2">
                  <GitBranch className="w-6 h-6" />
                  <span>Valider les relations</span>
                  <span className="text-xs opacity-70">Vérifier les liens entre fichiers</span>
                </Button>
              </div>

              {/* Validation Results */}
              {Object.keys(validationResults).length > 0 && (
                <div className="space-y-3 mt-4">
                  <h3 className="font-semibold text-foreground">Résultats de validation</h3>
                  {files.map(file => {
                    const result = validationResults[file.id];
                    if (!result) return null;
                    
                    return (
                      <div 
                        key={file.id}
                        className={cn(
                          'p-4 rounded-lg border',
                          result.valid ? 'bg-success/10 border-success/30' : 'bg-warning/10 border-warning/30'
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {result.valid ? (
                              <CheckCircle className="w-5 h-5 text-success" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-warning" />
                            )}
                            <span className="font-medium">{file.name}</span>
                          </div>
                          <span className={cn(
                            'text-sm font-semibold',
                            result.score >= 90 ? 'text-success' : result.score >= 70 ? 'text-warning' : 'text-destructive'
                          )}>
                            {result.score}%
                          </span>
                        </div>
                        
                        {result.warnings.length > 0 && (
                          <div className="text-sm text-muted-foreground space-y-1">
                            {result.warnings.map((w, i) => (
                              <div key={i}>• {w}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Generation Tab */}
            <TabsContent value="generate" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                  className="h-auto py-4 flex-col gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {isGenerating ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Rocket className="w-6 h-6" />
                  )}
                  <span>Générer les projets</span>
                  <span className="text-xs opacity-70">Backend NestJS + Frontend NextJS</span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col gap-2"
                  disabled={generatedProjects.length === 0}
                  onClick={() => generatedProjects.forEach(downloadProject)}
                >
                  <Download className="w-6 h-6" />
                  <span>Télécharger tout</span>
                  <span className="text-xs opacity-70">Exporter les projets générés</span>
                </Button>
              </div>

              {/* Generation Progress */}
              {(isGenerating || generationSteps.length > 0) && (
                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Progression</h3>
                    <span className="text-sm text-muted-foreground">{Math.round(generationProgress)}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                  
                  <div className="space-y-2">
                    {generationSteps.map(step => (
                      <div 
                        key={step.id}
                        className={cn(
                          'flex items-center gap-3 p-2 rounded-lg transition-colors',
                          step.status === 'running' && 'bg-primary/10',
                          step.status === 'success' && 'bg-success/10',
                          step.status === 'error' && 'bg-destructive/10'
                        )}
                      >
                        {step.status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-muted" />}
                        {step.status === 'running' && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                        {step.status === 'success' && <CheckCircle className="w-5 h-5 text-success" />}
                        {step.status === 'error' && <AlertTriangle className="w-5 h-5 text-destructive" />}
                        <span className={cn(
                          'text-sm',
                          step.status === 'pending' && 'text-muted-foreground',
                          step.status === 'running' && 'text-foreground font-medium',
                          step.status === 'success' && 'text-foreground',
                          step.status === 'error' && 'text-destructive'
                        )}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generated Projects Preview */}
              {generatedProjects.length > 0 && (
                <div className="space-y-4 mt-4">
                  <h3 className="font-semibold text-foreground">Projets générés</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {generatedProjects.map(project => (
                      <div key={project.type} className="p-4 rounded-lg border border-border bg-muted/30">
                        <div className="flex items-center gap-2 mb-3">
                          {project.type === 'backend' ? (
                            <Server className="w-5 h-5 text-block-backend" />
                          ) : (
                            <Globe className="w-5 h-5 text-block-frontend" />
                          )}
                          <span className="font-medium">
                            {project.type === 'backend' ? 'Backend NestJS' : 'Frontend NextJS'}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-3">
                          {project.files.length} fichiers générés
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => downloadProject(project)}
                          className="w-full"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Commands Tab */}
            <TabsContent value="commands" className="mt-0 space-y-4">
              {generatedProjects.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Terminal className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Générez d'abord les projets pour voir les commandes</p>
                </div>
              ) : (
                generatedProjects.map(project => (
                  <div key={project.type} className="space-y-4">
                    <div className="flex items-center gap-2">
                      {project.type === 'backend' ? (
                        <Server className="w-5 h-5 text-block-backend" />
                      ) : (
                        <Globe className="w-5 h-5 text-block-frontend" />
                      )}
                      <h3 className="font-semibold text-foreground">
                        {project.type === 'backend' ? 'Backend NestJS' : 'Frontend NextJS'}
                      </h3>
                    </div>

                    {/* Install Commands */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Package className="w-4 h-4" />
                        Installation
                      </div>
                      {project.commands.install.map((cmd, i) => (
                        <CommandLine 
                          key={i} 
                          command={cmd} 
                          copied={copiedCommand === cmd}
                          onCopy={() => copyCommand(cmd)}
                        />
                      ))}
                    </div>

                    {/* Run Commands */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Play className="w-4 h-4" />
                        Exécution
                      </div>
                      {project.commands.run.map((cmd, i) => (
                        <CommandLine 
                          key={i} 
                          command={cmd} 
                          copied={copiedCommand === cmd}
                          onCopy={() => copyCommand(cmd)}
                        />
                      ))}
                    </div>

                    {/* Test Commands */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <TestTube className="w-4 h-4" />
                        Tests
                      </div>
                      {project.commands.test.map((cmd, i) => (
                        <CommandLine 
                          key={i} 
                          command={cmd} 
                          copied={copiedCommand === cmd}
                          onCopy={() => copyCommand(cmd)}
                        />
                      ))}
                    </div>

                    {/* Build Commands */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Zap className="w-4 h-4" />
                        Build Production
                      </div>
                      {project.commands.build.map((cmd, i) => (
                        <CommandLine 
                          key={i} 
                          command={cmd} 
                          copied={copiedCommand === cmd}
                          onCopy={() => copyCommand(cmd)}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
};

// Command Line Component
const CommandLine: React.FC<{ 
  command: string; 
  copied: boolean;
  onCopy: () => void;
}> = ({ command, copied, onCopy }) => (
  <div className="flex items-center gap-2 bg-muted rounded-lg p-3 font-mono text-sm group">
    <span className="text-muted-foreground">$</span>
    <code className="flex-1 text-foreground">{command}</code>
    <Button
      variant="ghost"
      size="icon"
      className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={onCopy}
    >
      {copied ? (
        <Check className="w-4 h-4 text-success" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </Button>
  </div>
);

// Project Generation Functions
function generateBackendProject(files: TPFile[]): GeneratedProject {
  const databaseFile = files.find(f => f.type === 'database');
  const backendFile = files.find(f => f.type === 'backend');
  
  const dataModels = databaseFile?.blocks.filter(b => b.type === '@DataModel') || [];
  const enums = databaseFile?.blocks.filter(b => b.type === '@DataEnumeration') || [];
  
  const generatedFiles: { path: string; content: string }[] = [];
  
  // Generate Prisma schema
  let prismaSchema = `// Prisma Schema - Généré automatiquement par TP Editor
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

`;
  
  enums.forEach(e => {
    if (e.params.name && e.params.values) {
      prismaSchema += `enum ${e.params.name} {\n  ${e.params.values.replace(/,/g, '\n  ')}\n}\n\n`;
    }
  });
  
  dataModels.forEach(model => {
    if (model.params.name) {
      prismaSchema += `model ${model.params.name} {\n`;
      prismaSchema += `  id        String   @id @default(cuid())\n`;
      prismaSchema += `  createdAt DateTime @default(now())\n`;
      prismaSchema += `  updatedAt DateTime @updatedAt\n`;
      if (model.params.fields) {
        prismaSchema += `  ${model.params.fields.replace(/\n/g, '\n  ')}\n`;
      }
      prismaSchema += `}\n\n`;
    }
  });
  
  generatedFiles.push({ path: 'prisma/schema.prisma', content: prismaSchema });
  
  // Generate package.json
  const packageJson = {
    name: 'tp-backend',
    version: '1.0.0',
    scripts: {
      'start': 'nest start',
      'start:dev': 'nest start --watch',
      'start:prod': 'node dist/main',
      'build': 'nest build',
      'test': 'jest',
      'test:e2e': 'jest --config ./test/jest-e2e.json',
      'prisma:generate': 'prisma generate',
      'prisma:migrate': 'prisma migrate dev',
    },
    dependencies: {
      '@nestjs/common': '^10.0.0',
      '@nestjs/core': '^10.0.0',
      '@nestjs/platform-express': '^10.0.0',
      '@prisma/client': '^5.0.0',
      'class-validator': '^0.14.0',
      'class-transformer': '^0.5.1',
    },
    devDependencies: {
      '@nestjs/cli': '^10.0.0',
      '@types/node': '^20.0.0',
      'prisma': '^5.0.0',
      'typescript': '^5.0.0',
      'jest': '^29.0.0',
    },
  };
  
  generatedFiles.push({ path: 'package.json', content: JSON.stringify(packageJson, null, 2) });
  
  // Generate main.ts
  const mainTs = `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  await app.listen(3001);
  console.log('Backend running on http://localhost:3001');
}

bootstrap();
`;
  
  generatedFiles.push({ path: 'src/main.ts', content: mainTs });
  
  // Generate modules for each data model
  dataModels.forEach(model => {
    if (!model.params.name) return;
    const name = model.params.name.toLowerCase();
    
    const moduleContent = `import { Module } from '@nestjs/common';
import { ${model.params.name}Controller } from './${name}.controller';
import { ${model.params.name}Service } from './${name}.service';

@Module({
  controllers: [${model.params.name}Controller],
  providers: [${model.params.name}Service],
  exports: [${model.params.name}Service],
})
export class ${model.params.name}Module {}
`;
    generatedFiles.push({ path: `src/modules/${name}/${name}.module.ts`, content: moduleContent });
  });
  
  return {
    type: 'backend',
    files: generatedFiles,
    commands: {
      install: [
        'cd tp-backend',
        'npm install',
        'npx prisma generate',
        'npx prisma migrate dev --name init'
      ],
      run: [
        'npm run start:dev'
      ],
      test: [
        'npm run test',
        'npm run test:e2e'
      ],
      build: [
        'npm run build',
        'npm run start:prod'
      ],
    },
  };
}

function generateFrontendProject(files: TPFile[]): GeneratedProject {
  const frontendFile = files.find(f => f.type === 'frontend');
  const databaseFile = files.find(f => f.type === 'database');
  
  const pages = frontendFile?.blocks.filter(b => b.type === '@Page') || [];
  const components = frontendFile?.blocks.filter(b => b.type === '@Component') || [];
  const stores = frontendFile?.blocks.filter(b => b.type === '@Store') || [];
  const dataModels = databaseFile?.blocks.filter(b => b.type === '@DataModel') || [];
  
  const generatedFiles: { path: string; content: string }[] = [];
  
  // Generate package.json
  const packageJson = {
    name: 'tp-frontend',
    version: '1.0.0',
    scripts: {
      'dev': 'next dev',
      'build': 'next build',
      'start': 'next start',
      'lint': 'next lint',
      'test': 'jest',
    },
    dependencies: {
      'next': '^14.0.0',
      'react': '^18.0.0',
      'react-dom': '^18.0.0',
      'zustand': '^4.0.0',
      'tailwindcss': '^3.0.0',
      '@tanstack/react-query': '^5.0.0',
      'axios': '^1.0.0',
    },
    devDependencies: {
      '@types/node': '^20.0.0',
      '@types/react': '^18.0.0',
      'typescript': '^5.0.0',
      'jest': '^29.0.0',
      '@testing-library/react': '^14.0.0',
    },
  };
  
  generatedFiles.push({ path: 'package.json', content: JSON.stringify(packageJson, null, 2) });
  
  // Generate types from data models
  let typesContent = `// Types générés automatiquement par TP Editor\n\n`;
  dataModels.forEach(model => {
    if (model.params.name) {
      typesContent += `export interface ${model.params.name} {\n`;
      typesContent += `  id: string;\n`;
      typesContent += `  createdAt: Date;\n`;
      typesContent += `  updatedAt: Date;\n`;
      if (model.params.fields) {
        const fields = model.params.fields.split('\n').filter(Boolean);
        fields.forEach(field => {
          const [name, type] = field.trim().split(/\s+/);
          if (name && type) {
            typesContent += `  ${name}: ${mapTPTypeToTS(type)};\n`;
          }
        });
      }
      typesContent += `}\n\n`;
    }
  });
  
  generatedFiles.push({ path: 'src/types/index.ts', content: typesContent });
  
  // Generate pages
  pages.forEach(page => {
    if (!page.params.name || !page.params.path) return;
    
    const pageContent = `import React from 'react';

export default function ${page.params.name}Page() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">${page.params.name}</h1>
      {/* ${page.params.components || 'Components go here'} */}
    </div>
  );
}
`;
    const pagePath = page.params.path.replace(/^\//, '').replace(/\//g, '-') || page.params.name.toLowerCase();
    generatedFiles.push({ path: `src/app/${pagePath}/page.tsx`, content: pageContent });
  });
  
  // Generate stores
  stores.forEach(store => {
    if (!store.params.name) return;
    
    const storeContent = `import { create } from 'zustand';

interface ${store.params.name}State {
  ${store.params.state || '// state fields'}
}

interface ${store.params.name}Actions {
  ${store.params.actions || '// action methods'}
}

export const use${store.params.name} = create<${store.params.name}State & ${store.params.name}Actions>((set, get) => ({
  // Initial state
  ${store.params.state || ''}
  
  // Actions
  ${store.params.actions || ''}
}));
`;
    generatedFiles.push({ path: `src/stores/${store.params.name.toLowerCase()}.ts`, content: storeContent });
  });
  
  return {
    type: 'frontend',
    files: generatedFiles,
    commands: {
      install: [
        'cd tp-frontend',
        'npm install'
      ],
      run: [
        'npm run dev'
      ],
      test: [
        'npm run lint',
        'npm run test'
      ],
      build: [
        'npm run build',
        'npm run start'
      ],
    },
  };
}

function mapTPTypeToTS(tpType: string): string {
  const typeMap: Record<string, string> = {
    'String': 'string',
    'Int': 'number',
    'Float': 'number',
    'Boolean': 'boolean',
    'DateTime': 'Date',
    'Json': 'Record<string, unknown>',
    'Decimal': 'number',
  };
  return typeMap[tpType] || 'unknown';
}

export default GenerationPanel;
