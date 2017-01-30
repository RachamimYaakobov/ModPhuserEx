using Confuser.Core;
using dnlib.DotNet;
using System.Collections.Generic;

namespace Confuser.Renamer.Analyzers
{
    internal class AspNetCoreAnalyzer : IRenamer
    {
        public AspNetCoreAnalyzer()
        {
        }

        private static bool ShouldExclude(TypeDef type, IDnlibDef def)
        {
            return false;
        }

        public void Analyze(ConfuserContext context, INameService service, ProtectionParameters parameters, IDnlibDef def)
        {
            if (def is TypeDef)
                Analyze(context, service, (TypeDef)def, parameters);
            else if (def is MethodDef)
                Analyze(context, service, (MethodDef)def, parameters);
            else if (def is PropertyDef)
                Analyze(context, service, (PropertyDef)def, parameters);
            else if (def is FieldDef)
                Analyze(context, service, (FieldDef)def, parameters);
        }

        private void Analyze(ConfuserContext context, INameService service, TypeDef type, ProtectionParameters parameters)
        {
            // todo
        }

        private void Analyze(ConfuserContext context, INameService service, MethodDef method, ProtectionParameters parameters)
        {
            //
        }

        private void Analyze(ConfuserContext context, INameService service, PropertyDef property, ProtectionParameters parameters)
        {
            if (ShouldExclude(property.DeclaringType, property))
            {
                service.SetCanRename(property, false);
            }
        }

        private void Analyze(ConfuserContext context, INameService service, FieldDef field, ProtectionParameters parameters)
        {
            if (ShouldExclude(field.DeclaringType, field))
            {
                service.SetCanRename(field, false);
            }
        }

        public void PreRename(ConfuserContext context, INameService service, ProtectionParameters parameters, IDnlibDef def)
        {
            //
        }

        public void PostRename(ConfuserContext context, INameService service, ProtectionParameters parameters, IDnlibDef def)
        {
            //
        }
    }
}