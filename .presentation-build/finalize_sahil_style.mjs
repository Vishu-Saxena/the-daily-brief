import path from 'node:path';
import { finalizePresentation } from 'file:///C:/Users/grami/.codex/plugins/cache/openai-primary-runtime/presentations/26.1118.11504/skills/presentations/container_tools/artifact_tool_utils.mjs';
const workspaceDir=process.cwd();
const skillDir='C:/Users/grami/.codex/plugins/cache/openai-primary-runtime/presentations/26.1118.11504/skills/presentations';
const result=await finalizePresentation({
 explicitTotalSlideCount:14,
 requiredNativeTableOwnerSlides:[11],
 requiredNativeChartOwnerSlides:[],workspaceDir,
 candidatePath:path.join(workspaceDir,'.presentation-build','The_Daily_Brief_Sahil_Style_draft.pptx'),
 finalPath:path.join(workspaceDir,'deliverables','The_Daily_Brief_Sahil_Style_Moving_Index.pptx'),
 pythonExecutable:'C:/Users/grami/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',
 integrityValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(skillDir,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','9144000,6858000','--validate-bullet-geometry','--validate-heading-fit','--require-native-table-slide','11'],
 fontPolicy:{basis:'design',families:['Arial']},verifyArtifactToolImport:true,
 receiptPath:path.join(workspaceDir,'.presentation-build','The_Daily_Brief_Sahil_Style_Moving_Index_validation.json')
});
console.log(JSON.stringify(result));
