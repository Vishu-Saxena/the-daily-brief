import path from 'node:path';
import { finalizePresentation } from 'file:///C:/Users/grami/.codex/plugins/cache/openai-primary-runtime/presentations/26.1118.11504/skills/presentations/container_tools/artifact_tool_utils.mjs';
const workspaceDir=process.cwd();
const skillDir='C:/Users/grami/.codex/plugins/cache/openai-primary-runtime/presentations/26.1118.11504/skills/presentations';
const finalPath=path.join(workspaceDir,'deliverables','The_Daily_Brief_Vetting_Style.pptx');
const result=await finalizePresentation({
 explicitTotalSlideCount:20,
 requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],workspaceDir,
 candidatePath:path.join(workspaceDir,'.presentation-build','The_Daily_Brief_Vetting_Style_draft.pptx'),
 finalPath,
 pythonExecutable:'C:/Users/grami/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',
 integrityValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','9144000,6858000','--validate-bullet-geometry','--validate-heading-fit'],
 fontPolicy:{basis:'design',families:['Arial']},verifyArtifactToolImport:true,
 receiptPath:path.join(workspaceDir,'.presentation-build','The_Daily_Brief_Vetting_Style_validation.json')
});
console.log(JSON.stringify(result));
