import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { finalizePresentation } from 'file:///C:/Users/grami/.codex/plugins/cache/openai-primary-runtime/presentations/26.1117.11355/skills/presentations/container_tools/artifact_tool_utils.mjs';
const workspaceDir=process.cwd();
const skillDir='C:/Users/grami/.codex/plugins/cache/openai-primary-runtime/presentations/26.1117.11355/skills/presentations';
const finalPath=path.join(workspaceDir,'deliverables','The_Daily_Brief_Presentation_Easy_Language.pptx');
const result=await finalizePresentation({
 explicitTotalSlideCount:13,
 requiredNativeTableOwnerSlides:[],
 requiredNativeChartOwnerSlides:[],
 workspaceDir,
 candidatePath:path.join(workspaceDir,'.presentation-build','The_Daily_Brief_candidate.pptx'),
 finalPath,
 pythonExecutable:'C:/Users/grami/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',
 integrityValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit'],
 fontPolicy:{basis:'design',families:['Arial','Georgia']},
 verifyArtifactToolImport:true,
 receiptPath:path.join(workspaceDir,'.presentation-build','The_Daily_Brief_Easy_Language_validation.json')
});
console.log(JSON.stringify(result));
